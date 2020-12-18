import { Comment } from '@common/models/Comment';
import { Report } from '@common/models/Report';
import { User } from '@common/models/User';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { ReportsService } from '../reports/reports.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([Comment, Report, User])],
  providers: [CommentsService, ReportsService, UsersService]
})
export class UsersModule {}
