import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from "auth/auth.module";
import { ChatMessage } from '@common/models/chat-message.entity';
import { UsersModule } from "users/users.module";
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { SchedulesModule } from 'schedules/schedules.module';
import { SchedulesService } from 'schedules/schedules.service';
import { CalendarEvent } from '@common/models/calendar-event.entity';
import { PendingEvent } from '@common/models/pending-event.entity';
import { LoggerModule } from 'logger/logger.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => SchedulesModule),
    UsersModule,
    LoggerModule,
    TypeOrmModule.forFeature([CalendarEvent, ChatMessage, PendingEvent])
  ],
  providers: [ChatGateway, ChatService, SchedulesService],
  exports: [ChatGateway, ChatService]
})
export class ChatModule { }
