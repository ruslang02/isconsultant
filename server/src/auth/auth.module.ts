import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { LoggerModule } from "logger/logger.module";
import { RedisModule } from "redis/redis.module";
import { SnowflakeService } from "schedules/snowflake.service";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";
import { MailService } from "./mail.service";

@Module({
    controllers: [AuthController],
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: "1d",
            },
        }),
        PassportModule,
        LoggerModule,
        UsersModule,
        RedisModule
    ],
    exports: [JwtModule],
    providers: [AuthService, JwtStrategy, LocalStrategy, MailService, SnowflakeService],
})
export class AuthModule { }
