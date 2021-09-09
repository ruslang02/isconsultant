import { Report } from "@common/models/report.entity";
import { User } from "@common/models/user.entity";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SchedulesService } from "schedules/schedules.service";
import { SchedulesModule } from "schedules/schedules.module";
import { LoggerModule } from "logger/logger.module";
import { CalendarEvent } from "@common/models/calendar-event.entity";
import { PendingEvent } from "@common/models/pending-event.entity";
import { TimeSlot } from "@common/models/time-slot.entity";
import { ReportsService } from "../reports/reports.service";
import { UserAdapter } from "./user.adapter";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
    controllers: [UsersController],
    exports: [UsersService, UserAdapter],
    imports: [TypeOrmModule.forFeature([CalendarEvent, PendingEvent, Report, TimeSlot, User]),
        LoggerModule],
    providers: [ReportsService, SchedulesService, UsersService, UserAdapter],
})
export class UsersModule { }
