import { CreateUserDto } from '@common/dto/create-user.dto';
import { LoginUserSuccessDto } from '@common/dto/login-user-success.dto';
import { LoginUserDto } from '@common/dto/login-user.dto';
import { User, UserType } from '@common/models/user.entity';
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
    type: LoginUserDto,
  })
  async login(
    @Request() { user }: { user: Omit<User, 'password'> }
  ): Promise<LoginUserSuccessDto> {
    const access_token = await this.auth.login(user);

    const { id, type, first_name, middle_name, last_name, avatar } = user;

    return {
      access_token,
      user: {
        id,
        first_name,
        middle_name,
        last_name,
        avatar: avatar || "https://react.semantic-ui.com/images/avatar/small/matt.jpg",
        type: await this.i18n.t(`global.USER_TYPE_${type.toUpperCase()}`, {
          lang: 'ru',
        }),
      },
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
    type: CreateUserDto,
  })
  async register(@Body() u: CreateUserDto) {
    try {
      await this.users.insertOne({ ...u, type: UserType.CLIENT });
    } catch (e) {
      console.error(e);
      throw new BadRequestException(
        'Data entered did not match the format or the user exists.'
      );
    }
  }
}
