import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';

@Module({
  providers: [SchedulesService],
  controllers: [SchedulesController]
})
export class SchedulesModule {}
