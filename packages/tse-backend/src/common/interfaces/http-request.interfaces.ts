export interface RequestWithUser extends Request {
  user: {
    userId: string;
    clientId: string;
  };
}
