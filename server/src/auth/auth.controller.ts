import { CreateUserDto } from "@common/dto/create-user.dto";
import { LoginUserSuccessDto } from "@common/dto/login-user-success.dto";
import { LoginUserDto } from "@common/dto/login-user.dto";
import { TokenDto } from "@common/dto/token.dto";
import { User, UserType } from "@common/models/user.entity";
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
    Response,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { Response as ExpressResponse } from "express";
import { JwtAuthGuard } from "guards/jwt.guard";
import { UserGuard } from "guards/user.guard";
import { I18n, I18nContext, I18nService } from "nestjs-i18n";
import { RedisService } from "redis/redis.service";
import { SnowflakeService } from "schedules/snowflake.service";
import { UserAdapter } from "users/user.adapter";
import { ExtendedRequest } from "utils/ExtendedRequest";
import { generateId } from "utils/IdGenerator";
import { LocalAuthGuard } from "../guards/local.guard";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { MailService } from "./mail.service";

@ApiTags("Авторизация и регистрация пользователей")
@Controller("/api/auth")
export class AuthController {
    constructor(
        @Inject("Logger")
        private logger: LoggerService,
        private auth: AuthService,
        private i18n: I18nService,
        private users: UsersService,
        private verifyMail: MailService,
        private snowflake: SnowflakeService,
        private jwt: JwtService,
        private adapter: UserAdapter,
        private redis: RedisService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post("login")
    @ApiOkResponse({
        description: "Авторизация успешна, возвращается токен доступа.",
    })
    @ApiBadRequestResponse({
        description: "Аккаунт не был подтвержден, авторизация неуспешна.",
    })
    @ApiOperation({
        description:
      "Производит вход пользователя в систему путём возвращения JWT токена.",
    })
    @ApiBody({
        description: "Данные для входа.",
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

    @Post("register")
    @ApiCreatedResponse({
        description: "Регистрация успешна, аккаунт не подтвержден.",
    })
    @ApiBadRequestResponse({
        description: "Входные данные были неверными.",
    })
    @ApiOperation({
        description: "Производит регистрацию пользователя.",
    })
    @ApiBody({
        description: "Данные для регистрации.",
        type: CreateUserDto,
    })
    async register(@Body() u: CreateUserDto) {
        if (u.password.length < 6) {
            throw new BadRequestException(
                "The password is too short."
            );
        }
        if (!u.first_name || !u.last_name || !u.email || !u.password) {
            throw new BadRequestException(
                "Please fill all fields with a * sign."
            );
        }
        try {
            await this.users.insertOne({ ...u, type: UserType.CLIENT });
            // Send email!
            const data: Pick<User, "id" | "email" | "type"> = await this.users.findOneByEmail(u.email);
            const token = await this.auth.generateVerifyToken(data);
            this.verifyMail.send(data.email, token);

            return {
                access_token: this.jwt.sign({ id: data.id, verified: false, type: data.type }, { expiresIn: "1d" }),
                refresh_token: this.jwt.sign(this.snowflake.make()),
                user: data
            };
        } catch (e) {
            this.logger.error("/api/auth/register: ", "[ERROR]", e);
            throw new BadRequestException(
                "User with this email already exists."
            );
        }
    }

    @Post("refresh")
    @ApiOperation({
        description: "Обновление токена пользователя.",
    })
    @ApiBody({
        type: TokenDto,
    })
    async refreshToken(@Body() t: TokenDto) {
        const isInvalidated = (await this.redis.client.exists(`invalid_token-${t.refresh_token}`)) > 0;

        if (isInvalidated) throw new UnauthorizedException("This refresh token was revoked.");

        try {
            const { id, type } = this.jwt.verify<{ id: number; type: string }>(t.access_token);
            return {
                access_token: this.jwt.sign({ id, verified: false, type }, { expiresIn: "1d" }),
                refresh_token: this.jwt.sign(this.snowflake.make()),
            };
        } catch (e) {
            this.logger.error("/api/auth/refreshToken: ", "[ERROR]", e);
        }
    }

    @Post("invalidate")
    @ApiOperation({
        description: "Отзыв токена пользователя.",
    })
    @ApiBody({
        type: TokenDto,
    })
    async invalidateToken(@Body() t: TokenDto) {
        const isInvalidated = (await this.redis.client.exists(`invalid_token-${t.refresh_token}`)) > 0;

        if (isInvalidated) throw new UnauthorizedException("This refresh token was revoked.");

        try {
            await this.redis.client.set(`invalid_token-${t.refresh_token}`, Date.now());
            return {
                message: "OK."
            };
        } catch (e) {
            this.logger.error("/api/auth/refreshToken: ", "[ERROR]", e);
        }
    }

    @Post("login_temporary")
    @ApiCreatedResponse({
        description: "Регистрация успешна, аккаунт не подтвержден.",
    })
    @ApiBadRequestResponse({
        description: "Входные данные были неверными.",
    })
    @ApiOperation({
        description: "Производит регистрацию пользователя.",
    })
    @ApiBody({
        description: "Данные для регистрации.",
        type: CreateUserDto,
    })
    async loginTemporary(@Body() { name }: { name: string }) {
        const email = `temp+${generateId()}@consultant.infostrategic.com`;
        try {
            await this.users.insertOne({
                first_name: name,
                middle_name: "",
                last_name: "",
                email,
                password: Buffer.from(generateId().toString(), "binary").toString("base64"),
                type: UserType.CLIENT
            });
            // Send email!
            const data: Pick<User, "id" | "email" | "type"> = await this.users.findOneByEmail(email);

            return { access_token: this.jwt.sign({ id: data.id, verified: false, type: data.type }), user: data };
        } catch (e) {
            console.error("/api/auth/login_temporary: ", "[ERROR]", e.message);
            throw new BadRequestException(
                "Could not register temporary user."
            );
        }
    }

    @Get("verify/:verifyToken")
    async verify(@Param("verifyToken") token: string, @Response() response: ExpressResponse) {
        try {
            const { id, email } = this.jwt.verify<{ id: number; email: string }>(token);
            const user = await this.users.findOne(id);
            if (user.verified) {
                throw new BadRequestException("User already verified!");
            } else if (user.email != email) {
                throw new BadRequestException("Emails don't match!");
            } else {
                await this.users.updateOne(id, { verified: true });
                response.redirect("/?verify=success");
            }
        } catch (e) {
            this.logger.error("/api/auth/verify: ", "[ERROR]", e);
            throw new BadRequestException(
                "Token for verification is wrong! " + e
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get("janus")
    async janus() {
    }
}
