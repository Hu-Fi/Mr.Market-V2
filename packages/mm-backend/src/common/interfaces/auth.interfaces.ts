export interface AuthorizationResponse {
  user: UserResponse;
}

export interface UserResponse {
  user_id: string;
}

export interface JwtResponse {
  accessToken: string;
}
