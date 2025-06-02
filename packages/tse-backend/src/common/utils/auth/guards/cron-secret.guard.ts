import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class CronSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!process.env.CRON_SECRET) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      throw new UnauthorizedException(
        'Invalid or missing authorization header',
      );
    }

    return true;
  }
}
