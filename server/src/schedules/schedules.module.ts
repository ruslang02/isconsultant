import { CalendarEvent } from '@common/models/calendar-event.entity';
import { PendingEvent } from '@common/models/pending-event.entity.ts';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent, PendingEvent]),
    UsersModule,
  ],
  providers: [SchedulesService],
  controllers: [SchedulesController],
})
export class SchedulesModule {}
