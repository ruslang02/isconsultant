import { GetReportDto } from "@common/dto/get-report.dto";
import { Report } from "@common/models/report.entity";
import { LocalizedStringID } from "@common/utils/Locale";
import { Injectable } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { UserAdapter } from "users/user.adapter";

@Injectable()
export class ReportAdapter {
  constructor(public userAdapter: UserAdapter) { }

  public transform(i18n: I18nContext) {
    return async (report: Report): Promise<GetReportDto> => ({
      id: report.id.toString(),
      description: report.description,
      author: await this.userAdapter.transform(report.author, i18n),
      receiver: await this.userAdapter.transform(report.receiver, i18n),
      decision: report.decision,
      status: report.status,
      status_localized: await i18n.t(
        `global.REPORT_STATUS_${report.status.toUpperCase()}` as LocalizedStringID
      ),
      created_timestamp: report.created_timestamp.toISOString()
    });
  }
}