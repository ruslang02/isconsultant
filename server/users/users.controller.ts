import { Controller, Get, Inject, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('/api/users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get(':id')
  getUserInfo(@Param('id') userId: string) {
    return this.users.findOne(userId);
  }
}
