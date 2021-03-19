import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ChatMessage } from '@common/models/chat-message.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulesService } from 'schedules/schedules.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private messages: Repository<ChatMessage>,
    @Inject(forwardRef(() => SchedulesService))
    private schedules: SchedulesService
  ) { }

  async createChatMessage(uid: string, eid: string, content: string) {
    const { id } = await this.schedules.findEvent(eid);
    const message = new ChatMessage() as DeepPartial<ChatMessage>;
    message.from = { id: +uid };
    message.event = { id };
    message.content = content;

    return this.messages.save(message);
  }

  async getForEvent(eid: string, loadUsers?: boolean) {
    return this.messages.find({ where: { event: { id: eid } }, relations: loadUsers ? ["from"] : [], order: { created_timestamp: "ASC" } });
  }
}
