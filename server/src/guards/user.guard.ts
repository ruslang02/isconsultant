import { UserType } from '@common/models/user.entity';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExtendedRequest } from '../utils/ExtendedRequest';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const types = this.reflector.get<UserType[]>('types', context.getHandler());
    const {
      user,
      params,
    } = context.switchToHttp().getRequest<ExtendedRequest>();

    if (+params.uid === user?.id || !types || types.includes(user?.type)) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have enough permissions to perform this action.'
    );
  }
}
