import { CreateUserDto } from '@common/dto/create-user.dto';
import { LoginUserSuccessDto } from '@common/dto/login-user-success.dto';
import { LoginUserDto } from '@common/dto/login-user.dto';
import { User, UserType } from '@common/models/user.entity';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  LoggerService,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'guards/jwt.guard';
import { UserGuard } from 'guards/user.guard';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { UserAdapter } from 'users/user.adapter';
import { ExtendedRequest } from 'utils/ExtendedRequest';
import { LocalAuthGuard } from '../guards/local.guard';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { VerifyService } from './mail.service';

@ApiTags('Авторизация и регистрация пользователей')
@Controller('/api/auth')
export class AuthController {
  constructor(
    @Inject('Logger')
    private logger: LoggerService,
    private auth: AuthService,
    private i18n: I18nService,
    private users: UsersService,
    private verifyMail: VerifyService,
    private jwt: JwtService,
    private adapter: UserAdapter
  ) { }

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
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ): Promise<LoginUserSuccessDto> {
    const access_token = await this.auth.login(user);

    return {
      access_token,
      user: await this.adapter.transform(user, i18n)
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
      if (u.password.length < 6) {
        throw new BadRequestException(
          'The password is too short.'
        );
      }
      await this.users.insertOne({ ...u, type: UserType.CLIENT });
      // Send email!
      const data: Pick<User, 'id' | 'email' | 'type'> = await this.users.findOneByEmail(u.email);
      const token = await this.auth.generateVerifyToken(data);
      this.verifyMail.send(data.email, token)

      return { access_token: this.jwt.sign({ id: data.id, verified: false, type: data.type }) };
    } catch (e) {
      this.logger.error(`/api/auth/register: `, '[ERROR]', e);
      throw new BadRequestException(
        'Data entered did not match the format or the user exists.'
      );
    }
  }

  @Get('verify/:verifyToken')
  async verify(@Param('verifyToken') token: string) {
    try {
      const { id, email } = this.jwt.verify<{ id: number, email: string }>(token);
      const user = await this.users.findOne(id)
      if (user.verified) {
        throw new BadRequestException("User already verified!")
      } else if (user.email != email) {
        throw new BadRequestException("Emails don't match!")
      } else {
        await this.users.updateOne(id, { verified: true })
      }
    } catch (e) {
      this.logger.error(`/api/auth/verify: `, '[ERROR]', e);
      throw new BadRequestException(
        'Token for verification is wrong!'
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('janus')
  async janus() {
  }
}
