import { Comment } from '@common/models/Comment';
import { Report } from '@common/models/Report';
import { User, UserType } from '@common/models/User';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { ExtendedRequest } from '../utils/ExtendedRequest';
import { ReportsService } from '../reports/reports.service';
import { CommentsService } from './comments.service';
import { UsersService } from './users.service';
import { UserGuard } from 'server/guards/user.guard';
import { Types } from 'server/guards/type.decorator';

@ApiTags('Управление пользователями')
@Controller('/api/users')
export class UsersController {
  constructor(
    private comments: CommentsService,
    private reports: ReportsService,
    private users: UsersService
  ) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'Предоставлена информация о пользователе.',
    type: OmitType(User, ['password', 'phone', 'email'] as const),
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @ApiOperation({
    description: 'Получение информации о пользователе.',
  })
  async getUserInfo(@Param('id') userId: string): Promise<Partial<User>> {
    try {
      let user = await this.users.findOne(userId);
      delete user.password;
      return user;
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }

  @Types(UserType.ADMIN, UserType.MODERATOR)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Patch(':id')
  @ApiOkResponse({
    description: 'Данные пользователя были успешно изменены.',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @ApiBadRequestResponse({
    description: 'Формат принимаемых данных был неверным.',
  })
  @ApiForbiddenResponse({
    description: 'У пользователя нет прав на совершение этого действия.',
  })
  @ApiBearerAuth()
  @ApiBody({
    description: 'Изменяемая информация о пользователе.',
    type: OmitType(User, ['password'] as const),
  })
  @ApiOperation({
    description: 'Обновление пользовательских данных.',
  })
  async updateUserInfo(
    @Param('id') userId: string,
    @Body() data: Partial<User>
  ): Promise<Partial<User>> {
    if (data.password) {
      throw new BadRequestException(
        'The field "password" was not allowed for modification.'
      );
    }

    try {
      await this.users.updateOne(userId, data);

      return this.users.findOne(userId);
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/contacts')
  @ApiOkResponse({
    description: 'Предоставлена информация о контактных данных пользователя.',
    type: PickType(User, ['id', 'phone', 'email'] as const),
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Получение информации о контактных данных пользователя.',
  })
  async getUserContacts(@Param('id') userId: string): Promise<Partial<User>> {
    try {
      const { id, phone, email } = await this.users.findOne(userId);
      const user = { id, phone, email };
      return user;
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  @ApiOkResponse({
    description: 'Жалоба успешно оставлена.',
    type: Report,
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Оставление жалобы на профиль.',
  })
  async createUserReport(
    @Request() request: ExtendedRequest,
    @Param('id') receiverId: string,
    @Body() data: Pick<Report, 'description'>
  ) {
    const authorId = request.user.toString();

    const author = await this.users.findOne(authorId);
    const reciever = await this.users.findOne(receiverId);

    const report: Pick<Report, 'author' & 'description' & 'reciever'> = {
      author,
      description: data.description,
      reciever,
    };

    this.reports.createOne(report);
  }

  @Get(':id/comments')
  @ApiOkResponse({
    description: 'Приведен список комментариев для пользователя.',
    isArray: true,
    type: Comment,
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @ApiOperation({
    description: 'Получение комментарии пользователя.',
  })
  getUserComments(@Param('id') userId: string) {
    try {
      return this.comments.listAll(userId);
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }

  @Types(UserType.MODERATOR, UserType.ADMIN)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Delete(':id')
  @ApiForbiddenResponse({
    description: 'У пользователя нет прав на совершение этого действия.',
  })
  @ApiNoContentResponse({
    description: 'Пользователь был успешно удален.',
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Удаление пользователя.',
  })
  deleteUser(
    @Param('id') userId: string
  ) {
    try {
      return this.users.deleteOne(userId);
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }
}
