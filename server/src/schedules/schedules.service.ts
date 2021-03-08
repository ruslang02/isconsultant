import { PatchEventDto } from "@common/dto/patch-event.dto";
import { User } from "@common/models/user.entity";
import { ArrangeEventDto } from "@common/dto/arrange-event.dto";
import { CreateEventDto } from "@common/dto/create-event.dto";
import { GetEventDto } from "@common/dto/get-event.dto";
import { CalendarEvent, RoomAccess } from "@common/models/calendar-event.entity";
import { PendingEvent } from "@common/models/pending-event.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { UsersService } from "../users/users.service";

const genChar = () => String.fromCharCode(Math.round(Math.random() * (122 - 48) + 48));

const genRoomId = () => Math.round(Math.random() * 10_000_000);

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(CalendarEvent)
    private events: Repository<CalendarEvent>,
    @InjectRepository(PendingEvent)
    private pEvents: Repository<PendingEvent>,
    private users: UsersService
  ) {}

  async findManyByAuthor(uid: string) {
    return this.events
      .createQueryBuilder("event")
      .where("event.author_id = :uid", { uid })
      .getMany();
  }

  async findManyByLawyer(uid: string) {
    return this.events
      .createQueryBuilder("event")
      .where("event.owner_id = :uid", { uid })
      .getMany();
  }

  async findEvent(eid: string) {
    return this.events.findOne(eid, { relations: ["files"] });
  }

  async findAllEvents() {
    return this.events.find();
  }

  async findPendingEvents(uid: string) {
    return this.pEvents
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.from", "user")
      .where("event.lawyer_id = :uid", { uid })
      .getMany();
  }

  async transferEvent(eid: string) {
    const pending = await this.pEvents.findOne(eid, { relations: ["from"] });
    const event = new CalendarEvent() as DeepPartial<CalendarEvent>;
    event.id = +pending.id;
    event.title = `Meeting with ${pending.from.first_name} ${pending.from.last_name}`;
    event.description = pending.description;
    event.start_timestamp = pending.start_timestamp;
    event.end_timestamp = pending.end_timestamp;
    event.owner = { id: pending.lawyer.id };
    event.roomAccess = RoomAccess.ONLY_PARTICIPANTS;
    event.roomId = genRoomId();
    event.roomPassword = "";
    for (let i = 0; i < 6; i++) event.roomPassword += genChar();

    await this.events.save(event);
    return this.pEvents.delete(eid);
  }

  async deleteRequestEvent(eid: string) {
    return this.pEvents.delete(eid);
  }

  async createEvent(
    data: CreateEventDto & { user_id: string }
  ): Promise<CalendarEvent> {
    const event = new CalendarEvent() as DeepPartial<CalendarEvent>;
    event.title = data.title;
    event.description = data.description;
    event.start_timestamp = new Date(data.timespan_start);
    event.end_timestamp = new Date(data.timespan_end);
    event.owner = { id: Number(data.user_id) };
    event.roomAccess = event.roomAccess;
    event.roomId = Math.floor(Math.random() * 900_000_000) + 100_000_000;
    event.participants = data.participants.map((id) => ({ id: Number(id) }));

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
      model.participants = (data.participants.map((id) => ({
        id,
      })) as unknown) as User[];
    }

    await this.events.update(eventId, model);
  }

  async deleteEvent(eventId: string) {
    return this.events.delete(eventId);
  }

  async createPendingEvent(
    data: ArrangeEventDto & { user_id: string }
  ): Promise<PendingEvent> {
    const event = new PendingEvent() as DeepPartial<PendingEvent>;
    event.description = data.description;
    event.start_timestamp = new Date(data.timespan_start);
    event.end_timestamp = new Date(data.timespan_end);
    event.from = { id: Number(data.user_id) };
    event.lawyer = data.lawyer_id ? { id: Number(data.lawyer_id) } : undefined;

    const promises = data.additional_ids.map((id) => this.users.findOne(id));

    event.participants = await Promise.all(promises);

    return this.pEvents.save(event);
  }
}
