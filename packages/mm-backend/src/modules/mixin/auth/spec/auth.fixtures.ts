import { MixinOAuthCommand } from '../../../auth/model/auth.model';
import {
  JwtResponse,
  OAuthResponse,
} from '../../../../common/interfaces/auth.interfaces';

const OAUTH_CODE = 'a'.repeat(64);

export const mixinOAuthCommandFixture: MixinOAuthCommand = {
  code: OAUTH_CODE,
};

export const mixinOAuthResponseFixture: JwtResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
};

export const oauthResponseFixture: OAuthResponse = {
  clientDetails: {
    clientId: 'clientId',
    type: 'type',
  },
  clientSession: {
    authorizationId: 'authorization_id',
    privateKey: 'privateKey',
    publicKey: 'publicKey',
  },
};
