import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { File } from '@common/models/file.entity';
import { join } from 'path';
import { SnowflakeService } from './snowflake.service';
import { User } from '@common/models/user.entity';
import { SchedulesService } from './schedules.service';
import { Repository } from 'typeorm';
import { CalendarEvent } from '@common/models/calendar-event.entity';
import { ChatGateway } from 'chat/chat.gateway';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(CalendarEvent)
    private events: Repository<CalendarEvent>,
    @InjectRepository(File)
    private files: Repository<File>,
    private schedules: SchedulesService,
    private chat: ChatGateway
  ) { }

  public async get(fid: string) {
    return {
      ...(await this.files.findOne(fid)),
      path: join(process.env.STORAGE_LOCATION, fid)
    };
  }

  public async list(eid: string) {
    return (await this.events.findOne({ where: { id: eid }, relations: ["files"] })).files
  }

  public async create(fileName: string, fileId: string, ownerId: string, eventId: string) {
    const file = this.files.create();
    file.id = fileId;
    file.name = fileName;
    file.owner = { id: +ownerId } as User;
    await this.files.save(file);

    console.log("updating event");

    const event = await this.schedules.findEvent(eventId);
    const updEvent = { ...event, files: [...(event.files ?? []), file] };
    console.log(event, updEvent);
    await this.events.save(updEvent);

    this.chat.notifyNewFile(file, eventId);
  }
}
