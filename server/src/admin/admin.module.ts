import { CalendarEvent } from '@common/models/calendar-event.entity';
import { ChatMessage } from '@common/models/chat-message.entity';
import { File } from '@common/models/file.entity';
import { PendingEvent } from '@common/models/pending-event.entity';
import { Report } from '@common/models/report.entity';
import { User } from '@common/models/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'logger/logger.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [LoggerModule, TypeOrmModule.forFeature([Report, User, CalendarEvent, PendingEvent, Report, ChatMessage, File])],
})
export class AdminModule { }
