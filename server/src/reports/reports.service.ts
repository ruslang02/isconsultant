import { PatchReportDto } from '@common/dto/patch-report.dto';
import { Report, ReportStatus } from '@common/models/report.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reports: Repository<Report>
  ) { }

  createOne(data: Pick<Report, 'author' & 'description' & 'receiver'>) {
    const report = new Report();
    Object.assign(report, data, {
      status: ReportStatus.AWAITING,
    } as Partial<Report>);
    return this.reports.save(report);
  }

  find({ resolveUsers }: { resolveUsers: boolean }) {
    return this.reports.find({
      relations: ['author', 'receiver'],
    });
  }

  patchOne(reportId: string, report: PatchReportDto) {
    const upd: DeepPartial<Report> = {};
    if ('decision' in report) {
      upd.decision = report.decision;
    }
    if ('description' in report) {
      upd.description = report.description;
    }
    if ('receiver' in report) {
      upd.receiver = report.receiver && { id: +report.receiver };
    }
    if ('status' in report) {
      upd.status = report.status as ReportStatus;
    }
    return this.reports.update(reportId, upd);
  }
  findOne(reportId: string) {
    return this.reports.findOne(reportId, {
      relations: ['author', 'receiver'],
    });
  }
  deleteOne(reportId: string) {
    return this.reports.delete(reportId);
  }
}
