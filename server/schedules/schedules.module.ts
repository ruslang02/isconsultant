import { CalendarEvent } from '@common/models/CalendarEvent';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEvent])],
  providers: [SchedulesService],
  controllers: [SchedulesController],
})
export class SchedulesModule {}
