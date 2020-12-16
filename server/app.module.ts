import { CalendarEvent } from '@common/models/CalendarEvent';
import { Comment } from '@common/models/Comment';
import { Report } from '@common/models/Report';
import { User } from '@common/models/User';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { SchedulesModule } from './schedules/schedules.module';
import { UsersModule } from './users/users.module';

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
      entities: [CalendarEvent, Comment, Report, User],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../www'),
      exclude: ['/api/**', '/docs/**'],
    }),
    UsersModule,
    SchedulesModule,
    AuthModule,
  ],
})
export class AppModule {}
