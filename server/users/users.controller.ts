import { Comment } from '@common/models/Comment';
import { Report } from '@common/models/Report';
import { User, UserType } from '@common/models/User';
import { Locale, LocaleString } from '@common/utils/Locale';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  Response,
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
import { I18n, I18nContext, I18nLang, I18nService } from 'nestjs-i18n';
import { Types } from 'server/guards/type.decorator';
import { UserGuard } from 'server/guards/user.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { ReportsService } from '../reports/reports.service';
import { ExtendedRequest } from '../utils/ExtendedRequest';
import { CommentsService } from './comments.service';
import { UsersService } from './users.service';

@ApiTags('Управление пользователями')
@Controller('/api/users')
export class UsersController {
  constructor(
    private comments: CommentsService,
    private reports: ReportsService,
    private users: UsersService,
  ) {}

  async hydrateUser(user: User, i18n: I18nContext) {
    delete user.password;
    user.type_localized = await i18n.t(
      `global.USER_TYPE_${user.type.toUpperCase()}` as LocaleString
    );
    return user;
  }

  @Types(UserType.ADMIN, UserType.MODERATOR)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Get('')
  @ApiOperation({
    description: 'Получение всех зарегистрированных пользователей.',
  })
  async listUsers(
    @I18n() i18n: I18nContext
  ): Promise<User[]> {
    const users = await this.users.findMany();
    const hydrated = users.map((user) => this.hydrateUser(user, i18n));
    return Promise.all(hydrated);
  }

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
  deleteUser(@Param('id') userId: string) {
    try {
      return this.users.deleteOne(userId);
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }

  @Types(UserType.MODERATOR, UserType.ADMIN)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Post(':id/verified')
  @ApiForbiddenResponse({
    description: 'У пользователя нет прав на совершение этого действия.',
  })
  @ApiNoContentResponse({
    description: 'Профиль пользователя был успешно подтвержден.',
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Установка флага подтверждения пользователя.',
  })
  @ApiBody({
    description: 'Флаг подтверждения.',
    type: PickType(User, ['verified'] as const),
  })
  async setUserVerified(
    @Param('id') userId: string,
    @Body() { verified }: Pick<User, 'verified'>
  ) {
    try {
      await this.users.updateOne(userId, { verified });
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }
}
