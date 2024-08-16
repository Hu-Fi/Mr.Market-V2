import { Injectable } from '@nestjs/common';
import {
  base64RawURLEncode,
  getED25519KeyPair,
  Keystore,
  KeystoreClientReturnType,
  MixinApi,
} from '@mixin.dev/mixin-node-sdk';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../modules/logger/logger.service';

@Injectable()
export class MixinGateway {
  private readonly keystore: Keystore;
  private readonly _spendKey: string;
  private readonly _clientSecret: string;
  private _client: KeystoreClientReturnType;
  private readonly logger = new CustomLogger(MixinGateway.name);

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
    this._spendKey = this.configService.get<string>('MIXIN_SPEND_PRIVATE_KEY');
    this._clientSecret = this.configService.get<string>('MIXIN_OAUTH_SECRET');
    this._client = MixinApi({
      keystore: this.keystore,
    });
  }

  async oauthHandler(code: string) {
    const { publicKey } = getED25519KeyPair();
    const { authorization_id } = await this._client.oauth.getToken({
      client_id: this.keystore.app_id,
      code: code,
      ed25519: base64RawURLEncode(publicKey),
      client_secret: this._clientSecret,
    });
    return authorization_id;
  }

  async fetchSafeSnapshots() {
    try {
      return await this._client.safe.fetchSafeSnapshots({});
    } catch (error) {
      this.logger.error(error);
    }
  }
}
