import { CalendarEvent } from "@common/models/calendar-event.entity";
import { ChatMessage } from "@common/models/chat-message.entity";
import { File } from "@common/models/file.entity";
import { PendingEvent } from "@common/models/pending-event.entity";
import { Report } from "@common/models/report.entity";
import { User } from "@common/models/user.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatModule } from "chat/chat.module";
import { TimeSlot } from "@common/models/time-slot.entity";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { ReportsModule } from "./reports/reports.module";
import { SchedulesModule } from "./schedules/schedules.module";
import { UsersModule } from "./users/users.module";

const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
} = process.env;

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: POSTGRES_HOST,
            port: +POSTGRES_PORT,
            username: POSTGRES_USER,
            password: POSTGRES_PASSWORD,
            database: POSTGRES_DB,
            entities: [
                CalendarEvent,
                ChatMessage,
                File,
                PendingEvent,
                Report,
                TimeSlot,
                User,
            ],
            synchronize: true,
        }),
        UsersModule,
        SchedulesModule,
        AuthModule,
        ChatModule,
        ReportsModule,
        AdminModule,
    ],
    controllers: [],
    providers: [],
})
export class ApiModule {}
