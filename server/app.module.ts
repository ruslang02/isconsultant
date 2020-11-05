import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CallModule } from './call/call.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../www'),
      exclude: ['gateway']
    }),
    CallModule
  ]
})
export class AppModule {}
