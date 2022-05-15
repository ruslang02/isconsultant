import { CalendarEvent } from "@common/models/calendar-event.entity";
import { PendingEvent } from "@common/models/pending-event.entity";
import { User } from "@common/models/user.entity";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "auth/auth.module";
import { LoggerModule } from "logger/logger.module";
import { RedisModule } from "redis/redis.module";
import { SchedulesModule } from "schedules/schedules.module";
import { SchedulesService } from "schedules/schedules.service";
import { SnowflakeService } from "schedules/snowflake.service";
import { UsersModule } from "users/users.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
    imports: [
        AuthModule,
        forwardRef(() => SchedulesModule),
        UsersModule,
        LoggerModule,
        TypeOrmModule.forFeature([CalendarEvent, PendingEvent, User]),
        RedisModule
    ],
    providers: [ChatGateway, ChatService, SchedulesService, SnowflakeService],
    exports: [ChatGateway, ChatService]
})
export class ChatModule { }
