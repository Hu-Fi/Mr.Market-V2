import { AdminLoginCommand, AdminLoginDto } from '../model/auth.model';
import { createHash } from 'crypto';
import { JwtResponse } from '../../../common/interfaces/auth.interfaces';

const HASHED_ADMIN_PASSWORD = createHash('sha3-256')
  .update('admin_password')
  .digest('hex');

export const adminLoginDtoFixture: AdminLoginDto = {
  password: HASHED_ADMIN_PASSWORD,
};

export const adminLoginCommandFixture: AdminLoginCommand = {
  password: HASHED_ADMIN_PASSWORD,
};

export const adminLoginResponseFixture: JwtResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
};
