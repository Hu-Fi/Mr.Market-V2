export interface JwtResponse {
  accessToken: string;
}

export interface ClientDetails {
  clientId: string;
  type: string;
  identityNumber: string;
  fullName: string;
  avatarUrl: string;
}

export interface ClientSession {
  authorizationId: string;
  privateKey: string;
  publicKey: string;
}

export interface OAuthResponse {
  clientDetails: ClientDetails;
  clientSession: ClientSession;
}
