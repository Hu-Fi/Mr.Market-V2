import { Injectable } from '@nestjs/common';
import {
  base64RawURLEncode,
  buildSafeTransaction,
  buildSafeTransactionRecipient,
  encodeSafeTransaction,
  getED25519KeyPair,
  getUnspentOutputsForRecipients,
  Keystore,
  KeystoreClientReturnType,
  MixinApi,
  MixinCashier,
  SafeAsset,
  SafeUtxoOutput,
  SafeWithdrawalRecipient,
  signSafeTransaction,
} from '@mixin.dev/mixin-node-sdk';
import { ConfigService } from '@nestjs/config';
import {
  ClientSession,
  OAuthResponse,
} from '../common/interfaces/auth.interfaces';
import { DepositCommand } from '../modules/transaction/mixin-deposit/model/mixin-deposit.model';
import { v4 } from 'uuid';
import BigNumber from 'bignumber.js';
import { Fee } from '../common/interfaces/mixin.interfaces';
import { WithdrawCommand } from '../modules/transaction/mixin-withdraw/model/mixin-withdrawal.model';

@Injectable()
export class MixinGateway {
  private readonly keystore: Keystore;
  private readonly _clientSecret: string;
  private _client: KeystoreClientReturnType;
  private readonly spendPrivateKey: string;
  private readonly scope: string;

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
    this.spendPrivateKey = this.configService.get<string>(
      'MIXIN_SPEND_PRIVATE_KEY',
    );
    this.scope = this.configService.get<string>('MIXIN_OAUTH_SCOPE', 'PROFILE:READ ASSETS:READ SNAPSHOTS:READ');
  }

  async oauthHandler(code: string): Promise<OAuthResponse> {
    const { seed, publicKey } = getED25519KeyPair();
    const encodedPublicKey = base64RawURLEncode(publicKey);
    const encodedPrivateKey = Buffer.from(seed).toString('hex');

    const { authorization_id } = await this._client.oauth.getToken({
      client_id: this.keystore.app_id,
      code: code,
      ed25519: encodedPublicKey,
      client_secret: this._clientSecret,
    });

    const userProfile = await this._client.user.profile();

    return {
      clientDetails: {
        clientId: userProfile.user_id,
        type: userProfile.type,
        identityNumber: userProfile.identity_number,
        fullName: userProfile.full_name,
        avatarUrl: userProfile.avatar_url,
      },
      clientSession: {
        authorizationId: authorization_id,
        privateKey: encodedPrivateKey,
        publicKey: encodedPublicKey,
      },
    };
  }

  private async createMixinClientForUser(
    clientSession: ClientSession,
  ): Promise<KeystoreClientReturnType> {
    const { authorizationId, privateKey } = clientSession;
    const keystore = {
      app_id: this.keystore.app_id,
      scope: this.scope,
      authorization_id: authorizationId,
      session_private_key: privateKey,
    };

    return MixinApi({ keystore });
  }

  async createDepositAddress(command: DepositCommand) {
    const { chainId } = command;
    const payload = {
      members: [this.keystore.app_id],
      threshold: 1,
      chain_id: chainId,
    };

    const response = await this._client.safe.depositEntries(payload);
    return response[0].destination;
  }

  async getUnspentTransactionOutputs() {
    return await this._client.utxo.safeOutputs({
      state: 'unspent',
    });
  }

  async handleWithdrawal(command: WithdrawCommand) {
    const { assetId, destination } = command;
    const asset = await this._client.safe.fetchAsset(assetId);
    const chain = await this.getChainAsset(asset);
    const fees = await this._client.safe.fetchFee(asset.asset_id, destination);
    const transactionFee = this.getTransactionFee(
      fees,
      asset.asset_id,
      chain.asset_id,
    );

    // Check if the withdrawal fee is in a different asset than the one being withdrawn.
    // If the fee is in a different asset, execute the withdrawal process using the chain asset as the fee.
    // Otherwise, execute the withdrawal process using the asset itself as the fee.
    if (this.isFeeInDifferentAsset(transactionFee, asset)) {
      return await this.withdrawWithChainAssetAsFee(command, transactionFee);
    } else {
      return await this.withdrawWithAssetAsFee(command, transactionFee);
    }
  }

  private isFeeInDifferentAsset(fee: Fee, asset: SafeAsset): boolean {
    return fee.asset_id !== asset.asset_id;
  }

  private async getChainAsset(asset: SafeAsset) {
    if (asset.chain_id === asset.asset_id) {
      return asset;
    }
    return await this._client.safe.fetchAsset(asset.chain_id);
  }

  private getTransactionFee(fees: Fee[], assetId: string, chainId: string) {
    const assetFee = fees.find((f) => f.asset_id === assetId);
    const chainFee = fees.find((f) => f.asset_id === chainId);
    return assetFee ?? chainFee;
  }

  private hasPositiveChange(change: BigNumber): boolean {
    return !change.isZero() && !change.isNegative();
  }

  private async createRecipientsAndGhosts(
    command: WithdrawCommand,
    outputs: SafeUtxoOutput[],
    additionalRecipient?,
  ) {
    const { amount, destination } = command;
    const recipients: SafeWithdrawalRecipient[] = [
      { amount: amount, destination },
      ...(additionalRecipient ? [additionalRecipient] : []),
    ];

    const { change } = getUnspentOutputsForRecipients(outputs, recipients);
    if (this.hasPositiveChange(change)) {
      recipients.push(
        <SafeWithdrawalRecipient>(
          buildSafeTransactionRecipient(
            outputs[0].receivers,
            outputs[0].receivers_threshold,
            change.toString(),
          )
        ),
      );
    }

    const ghosts = await this._client.utxo.ghostKey(
      recipients
        .filter((r) => 'members' in r)
        .map((r, i) => ({
          hint: v4(),
          receivers: r.members as string[],
          index: i + 1,
        })),
    );

    return { recipients, ghosts };
  }

  private async createAndSendTransaction(
    utxos: SafeUtxoOutput[],
    recipients: SafeWithdrawalRecipient[],
    ghosts,
    memo: string,
    feeRef?,
  ) {
    // spare the 0 index for withdrawal output, withdrawal output doesn't need ghost key
    const tx = buildSafeTransaction(
      utxos,
      recipients,
      [undefined, ...ghosts],
      memo,
      feeRef ? [feeRef] : undefined,
    );
    const raw = encodeSafeTransaction(tx);
    const request_id = v4();
    const txs = await this._client.utxo.verifyTransaction([
      { raw, request_id },
    ]);
    const signedRaw = signSafeTransaction(
      tx,
      txs[0].views,
      this.spendPrivateKey,
    );
    const response = await this._client.utxo.sendTransactions([
      { raw: signedRaw, request_id },
    ]);
    return response[0];
  }

  private async withdrawWithChainAssetAsFee(
    command: WithdrawCommand,
    fee: Fee,
  ) {
    const { assetId } = command;

    const outputs = await this._client.utxo.safeOutputs({
      asset: assetId,
      state: 'unspent',
    });
    const feeOutputs = await this._client.utxo.safeOutputs({
      asset: fee.asset_id,
      state: 'unspent',
    });

    const { recipients, ghosts } = await this.createRecipientsAndGhosts(
      command,
      outputs,
      fee,
    );

    const feeRecipients = [{ amount: fee.amount, destination: MixinCashier }];
    const { utxos: feeUtxos } = getUnspentOutputsForRecipients(
      feeOutputs,
      feeRecipients,
    );

    const feeCommand: WithdrawCommand = {
      ...command,
      amount: fee.amount,
      destination: MixinCashier,
    };

    const { recipients: feeRecipientsWithChange, ghosts: feeGhosts } =
      await this.createRecipientsAndGhosts(feeCommand, feeOutputs, fee);

    const feeTx = await this.createAndSendTransaction(
      feeUtxos,
      feeRecipientsWithChange,
      feeGhosts,
      'withdrawal-fee-memo',
    );

    return await this.createAndSendTransaction(
      outputs,
      recipients,
      ghosts,
      'withdrawal-memo',
      feeTx,
    );
  }

  private async withdrawWithAssetAsFee(command: WithdrawCommand, fee: Fee) {
    const { assetId } = command;

    const outputs = await this._client.utxo.safeOutputs({
      asset: assetId,
      state: 'unspent',
    });

    const feeOutput = buildSafeTransactionRecipient(
      [MixinCashier],
      1,
      fee.amount,
    );
    const { recipients, ghosts } = await this.createRecipientsAndGhosts(
      command,
      outputs,
      feeOutput,
    );

    return await this.createAndSendTransaction(
      outputs,
      recipients,
      ghosts,
      'withdrawal-memo',
    );
  }

  async fetchTransactionDetails(txHash: string) {
    return await this._client.utxo.fetchTransaction(txHash);
  }

  async fetchUserBalanceDetails(clientSession: ClientSession) {
    const client = await this.createMixinClientForUser(clientSession);

    const utxoOutputs = await client.utxo.safeOutputs({ state: 'unspent' });
    const groupedUTXOs = this.groupAndSumUTXOs(utxoOutputs);

    const balanceSummary = await this.calculateBalances(client, groupedUTXOs);

    return {
      balances: balanceSummary.details,
      totalUSDBalance: balanceSummary.totalUSD.toFixed(2),
      totalBTCBalance: balanceSummary.totalBTC.toFixed(8),
    };
  }

  private groupAndSumUTXOs(utxoOutputs: SafeUtxoOutput[]) {
    return Object.values(
      utxoOutputs.reduce(
        (grouped, utxo) => {
          if (!grouped[utxo.asset_id]) {
            grouped[utxo.asset_id] = {
              asset_id: utxo.asset_id,
              amount: new BigNumber(0),
            };
          }
          grouped[utxo.asset_id].amount = grouped[utxo.asset_id].amount.plus(
            utxo.amount,
          );
          return grouped;
        },
        {} as Record<string, { asset_id: string; amount: BigNumber }>,
      ),
    );
  }

  private async calculateBalances(
    client: any,
    groupedUTXOs: { asset_id: string; amount: BigNumber }[],
  ) {
    let totalUSDBalance = new BigNumber(0);
    let totalBTCBalance = new BigNumber(0);

    const balanceDetails = await Promise.all(
      groupedUTXOs.map(async ({ asset_id, amount }) => {
        const asset = await client.safe.fetchAsset(asset_id);

        const balanceUSD = this.calculateValueInCurrency(
          amount,
          asset.price_usd,
        );
        const balanceBTC = this.calculateValueInCurrency(
          amount,
          asset.price_btc,
        );

        totalUSDBalance = totalUSDBalance.plus(balanceUSD);
        totalBTCBalance = totalBTCBalance.plus(balanceBTC);

        return {
          asset: asset.asset_id,
          symbol: asset.symbol,
          balance: this.roundToPrecision(amount, 8),
          balanceUSD: this.roundToPrecision(balanceUSD, 2),
          balanceBTC: this.roundToPrecision(balanceBTC, 8),
        };
      }),
    );

    return {
      details: balanceDetails,
      totalUSD: totalUSDBalance,
      totalBTC: totalBTCBalance,
    };
  }

  private calculateValueInCurrency(
    amount: BigNumber,
    price: string | number,
  ): BigNumber {
    return amount.multipliedBy(new BigNumber(price));
  }

  private roundToPrecision(value: BigNumber, precision: number): string {
    return value
      .decimalPlaces(precision, BigNumber.ROUND_HALF_UP)
      .toFixed(precision);
  }
}
