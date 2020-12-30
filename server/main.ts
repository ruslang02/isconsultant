import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
import { join } from 'path';
import { AppModule } from './app.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { SchedulesModule } from './schedules/schedules.module';
import { UsersModule } from './users/users.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '../../public'));
  app.setBaseViewsDir(join(__dirname, '../../views'));
  app.setViewEngine('hbs');

  const options = new DocumentBuilder()
    .setTitle('Приложение для проведения юридических консультаций.')
    .setDescription(
      'Интегрируемое в юридическое организацию решение, позволяющую организовать консультации через Интернет при помощи аудио- и видеоконференций при помощи технологии WebRTC.'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    include: [UsersModule, SchedulesModule, AuthModule, ReportsModule],
  });

  SwaggerModule.setup('docs', app, document);

  return app.listen(process.env.PORT);
}
bootstrap();
