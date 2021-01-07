import { Report, ReportStatus } from '@common/models/report.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reports: Repository<Report>
  ) {}

  createOne(data: Pick<Report, 'author' & 'description' & 'receiver'>) {
    const report = new Report();
    Object.assign(report, data, {
      status: ReportStatus.AWAITING,
    } as Partial<Report>);
    return this.reports.save(report);
  }

  find({ resolveUsers }: { resolveUsers: boolean }) {
    return this.reports.find({
      relations: resolveUsers ? ['author', 'receiver'] : [],
    });
  }
}
