export enum Role {
  USER = 'User',
  ADMIN = 'Admin',
}

export const ROLE_PRIORITIES = {
  [Role.USER]: 1,
  [Role.ADMIN]: 2,
};
