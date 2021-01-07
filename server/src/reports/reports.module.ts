import { Report } from '@common/models/report.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  imports: [TypeOrmModule.forFeature([Report])],
  providers: [ReportsService],
})
export class ReportsModule {}
