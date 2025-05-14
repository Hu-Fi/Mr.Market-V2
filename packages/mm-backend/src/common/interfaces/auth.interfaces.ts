export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ClientDetails {
  clientId: string;
  type: string;
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
