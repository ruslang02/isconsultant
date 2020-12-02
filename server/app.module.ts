import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../www'),
      exclude: ['api']
    }),
    UsersModule,
    SchedulesModule,
  ]
})
export class AppModule {}
