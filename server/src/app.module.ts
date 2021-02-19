import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ChatModule } from "chat/chat.module";
import { I18nJsonParser, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { ApiModule } from './api.module';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'ru',
      fallbacks: {
        'en-*': 'en',
        'ru-*': 'ru',
      },
      parser: I18nJsonParser,
      parserOptions: {
        path: join(__dirname, '../common/locales'),
        watch: true,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../admin/www'),
      serveRoot: '/admin',
    }),
    ApiModule,
    ChatModule,
  ]
})
export class AppModule {}
