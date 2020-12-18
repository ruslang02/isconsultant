import { UserType } from '@common/models/User';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExtendedRequest } from '../utils/ExtendedRequest';

export class UserGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const types = this.reflector.get<UserType[]>('types', context.getHandler());
    const {
      user,
      params,
    } = context.switchToHttp().getRequest<ExtendedRequest>();

    if (+params.id === user.id || !types || types.includes(user.type)) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have enough permissions to perform this action.'
    );
  }
}
