import { User, UserType } from '@common/models/User';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  PickType,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { LocalAuthGuard } from '../guards/local.guard';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@ApiTags('Авторизация и регистрация пользователей')
@Controller('/api/auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private i18n: I18nService,
    private users: UsersService
  ) {}

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
  async login(@Request() { user }: { user: Omit<User, 'password'> }) {
    const access_token = await this.auth.login(user);

    const modifiedUser = {
      ...user,
      type_localized: await this.i18n.t(
        `global.USER_TYPE_${user.type.toUpperCase()}`,
        { lang: 'ru' }
      ),
    };

    return {
      access_token,
      user: modifiedUser,
    };
  }

  @Post('register')
  @ApiCreatedResponse({
    description: 'Регистрация успешна, аккаунт не подтвержден.',
  })
  @ApiBadRequestResponse({
    description: 'Входные данные были неверными.',
  })
  @ApiOperation({
    description: 'Производит регистрацию пользователя.',
  })
  @ApiBody({
    description: 'Данные для регистрации.',
    type: PickType(User, [
      'email',
      'password',
      'first_name',
      'middle_name',
      'last_name',
    ]),
  })
  async register(
    @Body()
    u: Pick<
      User,
      'email' | 'password' | 'first_name' | 'middle_name' | 'last_name'
    >
  ) {
    try {
      await this.users.insertOne({ ...u, type: UserType.ADMIN });
    } catch (e) {
      console.error(e);
      throw new BadRequestException(
        'Data entered did not match the format or the user exists.'
      );
    }
  }
}
