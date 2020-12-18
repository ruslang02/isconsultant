import {
  Controller,
  Get,
  NotImplementedException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { ReportsService } from './reports.service';

@ApiTags('Обработка жалоб')
@Controller('/api/reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  getReports() {
    return this.reports.find();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateReportStatus() {
    throw new NotImplementedException();
  }
}
