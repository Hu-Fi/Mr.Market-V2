export interface AuthorizationResponse {
  user: UserResponse;
}

export interface UserResponse {
  user_id: string;
  type: string;
  identity_number: string;
  full_name: string;
  avatar_url: string;
}

export interface JwtResponse {
  accessToken: string;
}

export interface OAuthResponse {
  clientId: string;
  type: string;
  identityNumber: string;
  fullName: string;
  avatarUrl: string;
}