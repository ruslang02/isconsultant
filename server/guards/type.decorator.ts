import { UserType } from '@common/models/User';
import { SetMetadata } from '@nestjs/common';

export const Types = (...types: UserType[]) => SetMetadata('types', types);