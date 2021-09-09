import { CreateUserDto } from "@common/dto/create-user.dto";
import { LoginUserSuccessDto } from "@common/dto/login-user-success.dto";
import { LoginUserDto } from "@common/dto/login-user.dto";
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
        private jwt: JwtService,
        private adapter: UserAdapter
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

            return { access_token: this.jwt.sign({ id: data.id, verified: false, type: data.type }), user: data };
        } catch (e) {
            this.logger.error("/api/auth/register: ", "[ERROR]", e);
            throw new BadRequestException(
                "User with this email already exists."
            );
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
