import {
  AdminLoginCommand,
  AdminLoginDto,
  MixinOAuthCommand,
  MixinOAuthDto,
} from '../model/auth.model';
import { createHash } from 'crypto';
import {
  JwtResponse,
  OAuthResponse,
} from '../../../common/interfaces/auth.interfaces';

const OAUTH_CODE = 'a'.repeat(64);
const HASHED_ADMIN_PASSWORD = createHash('sha3-256')
  .update('admin_password')
  .digest('hex');

export const adminLoginDtoFixture: AdminLoginDto = {
  password: HASHED_ADMIN_PASSWORD,
};

export const adminLoginCommandFixture: AdminLoginCommand = {
  password: HASHED_ADMIN_PASSWORD,
};

export const mixinOAuthDtoFixture: MixinOAuthDto = {
  code: OAUTH_CODE,
};

export const mixinOAuthCommandFixture: MixinOAuthCommand = {
  code: OAUTH_CODE,
};

export const adminLoginResponseFixture: JwtResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
};

export const mixinOAuthResponseFixture: JwtResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
};

export const oauthResponseFixture: OAuthResponse = {
  clientDetails: {
    clientId: 'clientId',
    type: 'type',
    identityNumber: 'identityNumber',
    fullName: 'fullName',
    avatarUrl: 'avatarUrl',
  },
  clientSession: {
    authorizationId: 'authorization_id',
    privateKey: 'privateKey',
    publicKey: 'publicKey',
  },
};
