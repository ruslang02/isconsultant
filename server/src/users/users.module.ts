import { Report } from '@common/models/report.entity';
import { User } from '@common/models/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from '../reports/reports.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserAdapter } from './user.adapter';

@Module({
  controllers: [UsersController],
  exports: [UsersService, UserAdapter],
  imports: [TypeOrmModule.forFeature([Report, User])],
  providers: [ReportsService, UsersService, UserAdapter],
})
export class UsersModule { }
