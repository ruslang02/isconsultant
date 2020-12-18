import { Report, ReportStatus } from '@common/models/Report';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reports: Repository<Report>
  ) {}

  createOne(data: Pick<Report, 'author' & 'description' & 'reciever'>) {
    const report = new Report();
    Object.assign(report, data, {
      status: ReportStatus.AWAITING,
    } as Partial<Report>);
    return this.reports.save(report);
  }

  find() {
    return this.reports.find();
  }
}
