import { Injectable } from '@nestjs/common';
import {
  base64RawURLEncode,
  getED25519KeyPair,
  Keystore,
  KeystoreClientReturnType,
  MixinApi,
} from '@mixin.dev/mixin-node-sdk';
import { ConfigService } from '@nestjs/config';
import { AuthorizationResponse, OAuthResponse } from '../common/interfaces/auth.interfaces';
import { DepositCommand } from '../modules/transaction/model/transaction.model';

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
    const { userId, chainId } = command
    const payload = {
      members: [userId, this.keystore.app_id],
      threshold: 1,
      chain_id: chainId,
    };

    const response = await this._client.safe.depositEntries(payload);
    return response[0].destination;
  }

  async getDepositsInProgress(assetId: string, destination: string) {
    return await this._client.safe.pendingDeposits({
      asset: assetId,
      destination
    });
  }
}
