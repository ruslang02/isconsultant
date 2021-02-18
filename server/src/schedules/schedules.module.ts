import { CalendarEvent } from '@common/models/calendar-event.entity';
import { File } from '@common/models/file.entity';
import { PendingEvent } from '@common/models/pending-event.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from 'chat/chat.module';
import { UsersModule } from '../users/users.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { SnowflakeService } from './snowflake.service';
import { StorageService } from './storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent, File, PendingEvent]),
    UsersModule,
    ChatModule
  ],
  providers: [SchedulesService, SnowflakeService, StorageService],
  controllers: [SchedulesController],
})
export class SchedulesModule {}
