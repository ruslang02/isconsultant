import { User } from '@common/models/User';
import { Request } from 'express';

export type ExtendedRequest = Request & {
  user: Pick<User, 'id' | 'type' | 'verified'>
};