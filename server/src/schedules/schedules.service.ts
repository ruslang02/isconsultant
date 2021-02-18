import { PatchEventDto } from "@common/dto/patch-event.dto";
import { User } from "@common/models/user.entity";
import { ArrangeEventDto } from '@common/dto/arrange-event.dto';
import { CreateEventDto } from '@common/dto/create-event.dto';
import { GetEventDto } from '@common/dto/get-event.dto';
import { CalendarEvent } from '@common/models/calendar-event.entity';
import { PendingEvent } from '@common/models/pending-event.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(CalendarEvent)
    private events: Repository<CalendarEvent>,
    @InjectRepository(PendingEvent)
    private pEvents: Repository<PendingEvent>,
    private users: UsersService
  ) {}

  async findManyByUser(uid: string) {
    const events = await this.events
      .createQueryBuilder('event')
      .where('event.author_id = :uid', { uid })
      .getMany();
    
    return events.map((event) => ({
      description: event.description,
      title: event.title,
      timespan_start: event.start_timestamp.toUTCString(),
      timespan_end: event.end_timestamp.toUTCString(),
      owner: event.owner.id.toString(),
      participants: event.participants.map(({ id }) => id.toString()),
      room_id: event.roomId,
      room_access: event.roomAccess,
      room_password: event.roomPassword,
    })) as GetEventDto[];
  }

  async findEvent(eid: string) {
    return this.events.findOne(eid, {relations: ["files"]});
  }

  async createEvent(data: CreateEventDto & { user_id: string }): Promise<CalendarEvent> {
    const event = new CalendarEvent() as DeepPartial<CalendarEvent>;
    event.title = data.title;
    event.description = data.description;
    event.start_timestamp = new Date(data.timespan_start);
    event.end_timestamp = new Date(data.timespan_end);
    event.owner = { id: Number(data.user_id) };
    event.roomAccess = event.roomAccess;
    event.roomId = Math.floor(Math.random() * 900_000_000) + 100_000_000;
    event.participants = data.participants.map(id => ({ id: Number(id) }));

    return this.events.save(event);

  }

  async updateEvent(eventId: string, data: PatchEventDto) {
    const model = {} as Partial<CalendarEvent>;
    if (data.timespan_start) {
      model.start_timestamp = new Date(data.timespan_start);
    }
    if (data.timespan_end) {
      model.end_timestamp = new Date(data.timespan_end);
    }
    if (data.title) {
      model.title = data.title;
    }
    if (data.description) {
      model.description = data.description;
    }
    if (data.participants) {
      model.participants = data.participants.map(id => ({ id })) as unknown as User[];
    }

    await this.events.update(eventId, model);
  }

  async deleteEvent(eventId: string) {
    return this.events.delete(eventId);
  }

  async createPendingEvent(data: ArrangeEventDto & { lawyer_id: string, user_id: string }): Promise<PendingEvent> {
    const event = new PendingEvent() as DeepPartial<PendingEvent>;
    event.description = data.description;
    event.start_timestamp = new Date(data.timespan_start);
    event.end_timestamp = new Date(data.timespan_end);
    event.from = { id: Number(data.user_id) };

    const promises = data.additional_ids.map((id) => this.users.findOne(id));

    event.participants = await Promise.all(promises);

    return this.pEvents.create(event);
  }
}
