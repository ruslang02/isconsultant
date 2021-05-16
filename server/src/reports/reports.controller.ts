import { CreateReportDto } from '@common/dto/create-report.dto';
import { GetReportDto } from '@common/dto/get-report.dto';
import { PatchReportDto } from '@common/dto/patch-report.dto';
import { Report } from '@common/models/report.entity';
import { UserType } from '@common/models/user.entity';
import { LocalizedStringID } from '@common/utils/Locale';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Types } from 'guards/type.decorator';
import { UserGuard } from 'guards/user.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ExtendedRequest } from 'utils/ExtendedRequest';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { ReportAdapter } from './report.adapter';
import { ReportsService } from './reports.service';

@ApiTags('Обработка жалоб')
@Controller('/api/reports')
export class ReportsController {
  constructor(
    private adapter: ReportAdapter,
    private reports: ReportsService
  ) { }

  @Types(UserType.ADMIN, UserType.MODERATOR)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Get('/')
  @ApiOperation({
    description: "Получение всех жалоб в системе."
  })
  @ApiBearerAuth()
  async getReports(
    @Query('resolve_users') resolve_users: string,
    @I18n() i18n: I18nContext
  ) {
    const reports = await this.reports.find({
      resolveUsers: resolve_users === 'true',
    });

    return Promise.all(reports.map(this.adapter.transform(i18n)));
  }

  @Types(UserType.ADMIN, UserType.MODERATOR)
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiOperation({
    description: "Изменение статуса жалобы в системе."
  })
  @ApiBearerAuth()
  @Patch('/:rid')
  patchReport(
    @Param("rid") reportId: string,
    @Body() report: PatchReportDto
  ) {
    return this.reports.patchOne(reportId, report);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('/')
  @ApiOperation({
    description: "Создание жалобы."
  })
  @ApiBearerAuth()
  async createReport(
    @Request() { user }: ExtendedRequest,
    @Body() report: CreateReportDto
  ) {
    try {
      const entity = await this.reports.createOne({ ...report, author: user.id.toString() });
      return entity;
    } catch (e) {
      throw new BadRequestException("The data provided did not meet the schema.");
    }
  }

  @Types(UserType.ADMIN, UserType.MODERATOR)
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  @Delete('/:rid')
  @ApiOperation({
    description: "Удаление жалобы."
  })
  @ApiBearerAuth()
  deleteReport(
    @Param("rid") reportId: string
  ) {
    this.reports.deleteOne(reportId);
  }


  @Types(UserType.ADMIN, UserType.MODERATOR)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Get('/:rid')
  @ApiOperation({
    description: "Получение информации о жалобе."
  })
  @ApiBearerAuth()
  async getReportStatus(
    @I18n() i18n: I18nContext,
    @Param("rid") reportId: string
  ): Promise<GetReportDto> {
    return this.adapter.transform(i18n)(await this.reports.findOne(reportId));
  }
}
