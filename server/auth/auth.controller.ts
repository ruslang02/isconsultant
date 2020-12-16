import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Авторизация и регистрация пользователей')
@Controller('auth')
export class AuthController {}
