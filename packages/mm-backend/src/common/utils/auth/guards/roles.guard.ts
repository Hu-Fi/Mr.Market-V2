import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';
import { Role, ROLE_PRIORITIES } from '../../../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const userMaxRolePriority = Math.max(
      ...user.roles.map((role) => ROLE_PRIORITIES[role as Role]),
    );
    const requiredRolePriority = Math.max(
      ...requiredRoles.map((role) => ROLE_PRIORITIES[role as Role]),
    );

    return userMaxRolePriority >= requiredRolePriority;
  }
}
