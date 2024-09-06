import {
  AdminLoginCommand,
  AdminLoginDto,
  AdminLoginResponse,
  MixinOAuthCommand,
  MixinOAuthDto, MixinOAuthResponse,
} from '../model/auth.model';
import { createHash } from 'crypto';

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

export const adminLoginResponseFixture: AdminLoginResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
};

export const mixinOAuthResponseFixture: MixinOAuthResponse = {
  ed25519: 'some-ed25519-key',
  authorization_id: 'auth-1234',
  scope: 'read:profile write:messages',
};
