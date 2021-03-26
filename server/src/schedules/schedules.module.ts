import { CalendarEvent } from '@common/models/calendar-event.entity';
import { File } from '@common/models/file.entity';
import { PendingEvent } from '@common/models/pending-event.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from 'chat/chat.module';
import { LoggerModule } from 'logger/logger.module';
import { UserAdapter } from 'users/user.adapter';
import { UsersModule } from '../users/users.module';
import { EventAdapter } from './event.adapter';
import { PendingEventAdapter } from './pending-event.adapter';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { SnowflakeService } from './snowflake.service';
import { StorageService } from './storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent, File, PendingEvent]),
    UsersModule,
    forwardRef(() => ChatModule),
    LoggerModule
  ],
  providers: [EventAdapter, PendingEventAdapter, SchedulesService, SnowflakeService, StorageService, UserAdapter],
  controllers: [SchedulesController],
})
export class SchedulesModule { }
