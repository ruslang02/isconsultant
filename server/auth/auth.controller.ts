import { User } from '@common/models/User';
import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  PickType,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { I18nService } from 'nestjs-i18n';
import { LocalAuthGuard } from '../guards/local.guard';
import { AuthService } from './auth.service';

@ApiTags('Авторизация и регистрация пользователей')
@Controller('/api/auth')
export class AuthController {
  constructor(private auth: AuthService, private i18n: I18nService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOkResponse({
    description: 'Авторизация успешна, возвращается токен доступа.',
  })
  @ApiBadRequestResponse({
    description: 'Аккаунт не был подтвержден, авторизация неуспешна.',
  })
  @ApiOperation({
    description:
      'Производит вход пользователя в систему путём возвращения JWT токена.',
  })
  @ApiBody({
    description: 'Данные для входа.',
    type: PickType(User, ['email', 'password']),
  })
  async login(
    @Request() { user }: { user: Omit<User, 'password'> }
  ) {
    const access_token = await this.auth.login(user);

    const modifiedUser = {
      ...user,
      type_localized: await this.i18n.t(`USER_TYPE_${user.type.toUpperCase()}`, { lang: 'ru' }),
    };

    return {
      access_token,
      user: modifiedUser,
    };
  }
}
