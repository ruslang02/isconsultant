import { Report } from "@common/models/report.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "users/users.module";
import { ReportAdapter } from "./report.adapter";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
    controllers: [ReportsController],
    imports: [TypeOrmModule.forFeature([Report]), UsersModule],
    providers: [ReportAdapter, ReportsService],
})
export class ReportsModule { }
