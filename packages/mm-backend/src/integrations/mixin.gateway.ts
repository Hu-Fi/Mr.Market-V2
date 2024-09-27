import { Injectable } from '@nestjs/common';
import {
  base64RawURLEncode, buildSafeTransaction, encodeSafeTransaction,
  getED25519KeyPair, getUnspentOutputsForRecipients,
  Keystore,
  KeystoreClientReturnType,
  MixinApi, MixinCashier, SafeAsset, SafeWithdrawalRecipient, signSafeTransaction,
} from '@mixin.dev/mixin-node-sdk';
import { ConfigService } from '@nestjs/config';
import { AuthorizationResponse, OAuthResponse } from '../common/interfaces/auth.interfaces';
import { DepositCommand } from '../modules/transaction/deposit/model/deposit.model';
import { SafePendingDepositResponse } from '@mixin.dev/mixin-node-sdk/src/client/types/safe';
import { WithdrawCommand } from '../modules/transaction/withdraw/model/withdraw.model';
import { v4 } from 'uuid';
import BigNumber from 'bignumber.js';

@Injectable()
export class MixinGateway {
  private readonly keystore: Keystore;
  private readonly _clientSecret: string;
  private _client: KeystoreClientReturnType;

  constructor(private configService: ConfigService) {
    this.keystore = {
      app_id: this.configService.get<string>('MIXIN_APP_ID'),
      session_id: this.configService.get<string>('MIXIN_SESSION_ID'),
      server_public_key: this.configService.get<string>(
        'MIXIN_SERVER_PUBLIC_KEY',
      ),
      session_private_key: this.configService.get<string>(
        'MIXIN_SESSION_PRIVATE_KEY',
      ),
    };
    this._clientSecret = this.configService.get<string>('MIXIN_OAUTH_SECRET');
    this._client = MixinApi({
      keystore: this.keystore,
    });
  }

  async oauthHandler(code: string): Promise<OAuthResponse> {
    const { publicKey } = getED25519KeyPair();
    const tokenResponse = await this._client.oauth.getToken({
      client_id: this.keystore.app_id,
      code: code,
      ed25519: base64RawURLEncode(publicKey),
      client_secret: this._clientSecret,
    });

    const authorization = (await this._client.oauth.authorize({
      authorization_id: tokenResponse.authorization_id,
      scopes: ['PROFILE:READ'],
    })) as unknown as AuthorizationResponse;
    return {
      clientId: authorization.user.user_id,
      type: authorization.user.type,
      identityNumber: authorization.user.identity_number,
      fullName: authorization.user.full_name,
      avatarUrl: authorization.user.avatar_url,
    };
  }

  async getDepositAddress(command: DepositCommand) {
    const { chainId } = command;
    const payload = {
      members: [this.keystore.app_id],
      threshold: 1,
      chain_id: chainId,
    };

    const response = await this._client.safe.depositEntries(payload);
    return response[0].destination;
  }

  async getDepositsInProgress(assetId: string, offset?: string): Promise<SafePendingDepositResponse[]> {
    return await this._client.safe.pendingDeposits({
      asset: assetId,
      offset,
    });
  }

  async handleWithdrawal(command: WithdrawCommand): Promise<any> {
    const { assetId, destination } = command;
    const asset = await this._client.safe.fetchAsset(assetId);
    const chain = await this.getChainAsset(asset);
    const fees = await this._client.safe.fetchFee(asset.asset_id, destination);
    const fee = this.getTransactionFee(fees, asset.asset_id, chain.asset_id);

    // Check if the withdrawal fee is in a different asset than the one being withdrawn.
    // If the fee is in a different asset, execute the withdrawal process using the chain asset as the fee.
    // Otherwise, execute the withdrawal process using the asset itself as the fee.
    if (this.isFeeInDifferentAsset(fee, asset)) {
      return await this.withdrawWithChainAssetAsFee(command, fee);
    } else {
      return await this.withdrawWithAssetAsFee(command);
    }
  }

  private isFeeInDifferentAsset(fee: any, asset: any): boolean {
    return fee.asset_id !== asset.asset_id;
  }

  private async getChainAsset(asset: SafeAsset) {
    if (asset.chain_id === asset.asset_id) {
      return asset;
    }
    return await this._client.safe.fetchAsset(asset.chain_id);
  }

  private getTransactionFee(fees: any[], assetId: string, chainId: string) {
    const assetFee = fees.find(f => f.asset_id === assetId);
    const chainFee = fees.find(f => f.asset_id === chainId);
    return assetFee ?? chainFee;
  }

  private hasPositiveChange(change: BigNumber): boolean {
    return !change.isZero() && !change.isNegative();
  }

  private async createRecipientsAndGhosts(command: WithdrawCommand, outputs: any[], additionalRecipient?: {
    amount: string,
    destination: string
  }): Promise<{ recipients: SafeWithdrawalRecipient[], ghosts: any[] }> {
    const { amount, destination } = command;
    const recipients: SafeWithdrawalRecipient[] = [
      { amount: amount.toString(), destination },
      ...(additionalRecipient ? [additionalRecipient] : []),
    ];

    const { change } = getUnspentOutputsForRecipients(outputs, recipients);
    if (this.hasPositiveChange(change)) {
      recipients.push({
        amount: change.toString(),
        destination: outputs[0].receivers[0],
      });
    }

    const ghosts = await this._client.utxo.ghostKey(
      recipients.map((r, i) => ({
        hint: v4(),
        receivers: [r.destination],
        index: i + 1,
      })),
    );

    return { recipients, ghosts };
  }

  private async createAndSendTransaction(utxos: any[], recipients: SafeWithdrawalRecipient[], ghosts: any[], memo: string, feeRef?: string): Promise<any> {
    // spare the 0 index for withdrawal output, withdrawal output doesn't need ghost key
    const tx = buildSafeTransaction(utxos, recipients, [undefined, ...ghosts], memo, feeRef ? [feeRef] : undefined);
    const raw = encodeSafeTransaction(tx);
    const request_id = v4();
    const txs = await this._client.utxo.verifyTransaction([{ raw, request_id }]);
    const signedRaw = signSafeTransaction(tx, txs[0].views, this.keystore.session_private_key);

    return await this._client.utxo.sendTransactions([{ raw: signedRaw, request_id }]);
  }

  private async withdrawWithChainAssetAsFee(command: WithdrawCommand, fee: any) {
    const { assetId } = command;

    const outputs = await this._client.utxo.safeOutputs({
      asset: assetId,
      state: 'unspent',
    });
    const feeOutputs = await this._client.utxo.safeOutputs({
      asset: fee.asset_id,
      state: 'unspent',
    });

    const { recipients, ghosts } = await this.createRecipientsAndGhosts(command, outputs, fee);

    const feeRecipients = [{ amount: fee.amount, destination: MixinCashier }];
    const { utxos: feeUtxos } = getUnspentOutputsForRecipients(feeOutputs, feeRecipients);

    const feeCommand: WithdrawCommand = {
      ...command,
      amount: fee.amount,
      destination: MixinCashier,
    };

    const {
      recipients: feeRecipientsWithChange,
      ghosts: feeGhosts,
    } = await this.createRecipientsAndGhosts(feeCommand, feeOutputs, fee);

    const feeTx = await this.createAndSendTransaction(feeUtxos, feeRecipientsWithChange, feeGhosts, 'withdrawal-fee-memo');

    return await this.createAndSendTransaction(outputs, recipients, ghosts, 'withdrawal-memo', feeTx);
  }


  private async withdrawWithAssetAsFee(command: WithdrawCommand) {
    const { assetId } = command;

    const outputs = await this._client.utxo.safeOutputs({
      asset: assetId,
      state: 'unspent',
    });

    const { recipients, ghosts } = await this.createRecipientsAndGhosts(command, outputs);

    return await this.createAndSendTransaction(outputs, recipients, ghosts, 'withdrawal-memo');
  }

}
