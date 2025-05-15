import { MixinOAuthCommand } from '../../../auth/model/auth.model';
import { OAuthResponse } from '../../../../common/interfaces/auth.interfaces';

const OAUTH_CODE = 'a'.repeat(64);

export const mixinOAuthCommandFixture: MixinOAuthCommand = {
  code: OAUTH_CODE,
};

export const mixinOAuthResponseFixture = {
  userId: '00fcc4f4-8703-44ba-8d14-f5ef02a3b8a1',
  clientId: 'clientId',
  roles: ['User'],
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
