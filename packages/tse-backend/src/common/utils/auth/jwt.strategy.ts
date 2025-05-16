import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(secret: string) {
    if (!secret) {
      throw new Error(
        `JwtStrategy initialization failed: JWT secret is missing.

Please make sure to start 'mm-backend' first, as it provides the authentication configuration.
This requirement is documented in HOW_TO_DEPLOY.md and HOW_TO_RUN.md.
        `,
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      clientId: payload.clientId,
      roles: payload.roles || [],
    };
  }
}
