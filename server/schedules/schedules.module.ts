import { CalendarEvent } from '@common/models/CalendarEvent';
import { PendingEvent } from '@common/models/PendingEvent';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'server/users/users.module';
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
