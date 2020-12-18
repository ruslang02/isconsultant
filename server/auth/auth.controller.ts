import { User } from '@common/models/User';
import {
  BadRequestException,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBasicAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags, PickType } from '@nestjs/swagger';
import { LocalAuthGuard } from '../guards/local.guard';
import { ExtendedRequest } from '../utils/ExtendedRequest';
import { AuthService } from './auth.service';

@ApiTags('Авторизация и регистрация пользователей')
@Controller('/api/auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOkResponse({
    description: 'Авторизация успешна, возвращается токен доступа.'
  })
  @ApiBadRequestResponse({
    description: 'Аккаунт не был подтвержден, авторизация неуспешна.'
  })
  @ApiOperation({
    description: 'Производит вход пользователя в систему путём возвращения JWT токена.'
  })
  @ApiBody({
    description: 'Данные для входа.',
    type: PickType(User, ['email', 'password'])
  })
  async login(@Request() req: ExtendedRequest) {
    return this.auth.login(req.user);
  }
}
