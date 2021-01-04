import { Report } from '@common/models/Report';
import { LocalizedStringID } from '@common/utils/Locale';
import {
  Controller,
  Get,
  NotImplementedException,
  ParseBoolPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { ReportsService } from './reports.service';

@ApiTags('Обработка жалоб')
@Controller('/api/reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  async hydrateReport(report: Report, i18n: I18nContext) {
    const hydratedReport = { ...report };
    hydratedReport.status_localized = await i18n.t(
      `global.REPORT_STATUS_${report.status.toUpperCase()}` as LocalizedStringID
    );
    return hydratedReport;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getReports(
    @Query('resolve_users') resolve_users: string,
    @I18n() i18n: I18nContext
  ) {
    const reports = await this.reports.find({
      resolveUsers: resolve_users === 'true',
    });
    const hydrated = reports.map((report) => this.hydrateReport(report, i18n));
    return Promise.all(hydrated);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateReportStatus() {
    throw new NotImplementedException();
  }
}
