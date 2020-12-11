import { User } from '@common/models/User';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Управление пользователями')
@Controller('/api/users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'Предоставлена информация о пользователе.',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.'})
  getUserInfo(@Param('id') userId: string): Promise<User> {
    try {
      return this.users.findOne(userId);
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }
}
