import { GetUserContactsDto } from '@common/dto/get-user-contacts.dto';
import { GetUserInfoDto } from '@common/dto/get-user-info.dto';
import { GetUserDto } from '@common/dto/get-user.dto';
import { PatchUserVerifiedDto } from '@common/dto/patch-user-verified.dto';
import { PatchUserDto } from '@common/dto/patch-user.dto';
import { Report } from '@common/models/report.entity';
import { User, UserType } from '@common/models/user.entity';
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
  Query,
  Request,

  UseGuards
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
  ApiTags
} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { In } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { Types } from '../guards/type.decorator';
import { UserGuard } from '../guards/user.guard';
import { ReportsService } from '../reports/reports.service';
import { ExtendedRequest } from '../utils/ExtendedRequest';
import { UserAdapter } from './user.adapter';
import { UsersService } from './users.service';

@ApiTags('Управление пользователями')
@Controller('/api/users')
export class UsersController {
  constructor(
    private reports: ReportsService,
    private users: UsersService,
    private adapter: UserAdapter
  ) { }

  @Get("search")
  @ApiOperation({
    description: 'Поиск пользователей.',
  })
  async searchUsers(
    @Query("query") query: string,
    @Query("ids") ids: string,
    @I18n() i18n: I18nContext
  ) {
    const users = query ? await this.users.search(query) : ids ? await this.users.findMany({ where: { id: In(ids.split(',')) } }) : [];
    return Promise.all(users.map(u => this.adapter.transform(u, i18n)));
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  @ApiOperation({
    description: 'Получение всех зарегистрированных пользователей.',
  })
  @ApiBearerAuth()
  async listUsers(@I18n() i18n: I18nContext): Promise<GetUserDto[]> {
    const users = await this.users.findMany();
    const hydrated = users.map((user) => this.adapter.transform(user, i18n));
    return Promise.all(hydrated);
  }

  @UseGuards(JwtAuthGuard)
  @Get('@me')
  @ApiOperation({
    description: 'Получение всех зарегистрированных пользователей.',
  })
  @ApiBearerAuth()
  async getMe(
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ): Promise<GetUserDto> {
    const fullUser = await this.users.findOne(user.id);
    const hydrated = this.adapter.transform(fullUser, i18n);
    return hydrated;
  }

  @Get('top')
  @ApiOperation({
    description: 'Получение лучших юристов в организации.',
  })
  async getTopLawyers(@I18n() i18n: I18nContext) {
    return Promise.all(
      (
        await this.users.findMany({
          where: {
            type: UserType.LAWYER
          },
          order: {
            rating: "DESC"
          },
          take: 4
        })
      ).map(u => this.adapter.transform(u, i18n))
    );
  }

  @Get(':uid')
  @ApiOkResponse({
    description: 'Предоставлена информация о пользователе.',
    type: GetUserInfoDto,
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @ApiOperation({
    description: 'Получение информации о пользователе.',
  })
  async getUserInfo(@Param('uid') userId: string, @I18n() i18n: I18nContext): Promise<GetUserInfoDto> {
    try {
      const user = await this.users.findOne(userId);
      return this.adapter.transform(user, i18n);
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }

  @Types(UserType.ADMIN, UserType.MODERATOR)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Patch(':uid')
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
    type: PatchUserDto,
  })
  @ApiOperation({
    description: 'Обновление пользовательских данных.',
  })
  async updateUserInfo(
    @Param('uid') userId: string,
    @Body() data: PatchUserDto,
    @I18n() i18n: I18nContext
  ): Promise<GetUserDto> {
    /*
    if (data.password) {
      throw new BadRequestException(
        'The field "password" was not allowed for modification.'
      );
    }
    */

    try {
      await this.users.updateOne(userId, data);
      const user = await this.users.findOne(userId);
      return this.adapter.transform(user, i18n);
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':uid/contacts')
  @ApiOkResponse({
    description: 'Предоставлена информация о контактных данных пользователя.',
    type: GetUserContactsDto,
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Получение информации о контактных данных пользователя.',
  })
  async getUserContacts(
    @Param('uid') userId: string
  ): Promise<GetUserContactsDto> {
    try {
      const { id, phone, email } = await this.users.findOne(userId);
      return { id, phone, email };
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':uid/report')
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
    @Param('uid') receiverId: string,
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

  @Types(UserType.MODERATOR, UserType.ADMIN)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Delete(':uid')
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
  deleteUser(@Param('uid') userId: string) {
    try {
      return this.users.deleteOne(userId);
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }

  @Types(UserType.MODERATOR, UserType.ADMIN)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Post(':uid/verified')
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
    type: PatchUserVerifiedDto,
  })
  async setUserVerified(
    @Param('uid') userId: string,
    @Body() { verified }: PatchUserVerifiedDto
  ) {
    try {
      await this.users.updateOne(userId, { verified });
    } catch (e) {
      throw new NotFoundException('The user does not exist.');
    }
  }

  @Post(':uid/rating')
  async modifyUserRating(
    @Param('uid') userId: string,
    @Query('offset') offset: string
  ) {
    if (+offset < -2 || +offset > 2) throw new BadRequestException("Offset should be between -2 and 2.");
    const user = await this.users.findOne(userId);
    await this.users.updateOne(userId, { rating: user.rating + +offset });
  }
}
