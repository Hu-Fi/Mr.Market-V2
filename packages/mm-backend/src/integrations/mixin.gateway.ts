import { Injectable } from '@nestjs/common';
import {
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
  private readonly _client: KeystoreClientReturnType;
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
    this._client = MixinApi({
      keystore: this.keystore,
    });
  }

  async fetchSafeSnapshots() {
    try {
      return await this._client.safe.fetchSafeSnapshots({});
    } catch (error) {
      this.logger.error(error);
    }
  }
}
