import { CalendarEvent } from '@common/models/calendar-event.entity';
import { Comment } from '@common/models/comment.entity';
import { PendingEvent } from '@common/models/pending-event.entity';
import { Report } from '@common/models/report.entity';
import { User } from '@common/models/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { SchedulesModule } from './schedules/schedules.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { File } from '@common/models/file.entity';

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} = process.env;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: POSTGRES_HOST,
      port: +POSTGRES_PORT,
      username: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
      entities: [CalendarEvent, Comment, File, PendingEvent, Report, User],
      synchronize: true,
    }),
    UsersModule,
    SchedulesModule,
    AuthModule,
    ReportsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
