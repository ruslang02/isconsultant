import { ArrangeEventDto } from "@common/dto/arrange-event.dto";
import { CreateEventDto } from "@common/dto/create-event.dto";
import { PatchEventDto } from "@common/dto/patch-event.dto";
import {
  CalendarEvent,
  RoomAccess,
  Status,
} from "@common/models/calendar-event.entity";
import { PendingEvent } from "@common/models/pending-event.entity";
import { User } from "@common/models/user.entity";
import {
  Inject,
  Injectable,
  LoggerService,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
const Janus = require("janus-gateway-js");
const genChar = () =>
  String.fromCharCode(Math.round(Math.random() * (122 - 48) + 48));

const genRoomId = () => Math.round(Math.random() * 10_000_000);

const { JANUS } = process.env;

@Injectable()
export class SchedulesService implements OnModuleInit {
  constructor(
    @Inject("Logger")
    private logger: LoggerService,
    @InjectRepository(CalendarEvent)
    private events: Repository<CalendarEvent>,
    @InjectRepository(PendingEvent)
    private pEvents: Repository<PendingEvent>
  ) { }

  private pluginHandle: any;

  async onModuleInit() {
    try {
      var client = new Janus.Client(JANUS, {
        token: "",
        apisecret: "",
        keepalive: "true",
      });

      var connection = await client.createConnection();
      var session = await connection.createSession();
      this.pluginHandle = await session.attachPlugin("janus.plugin.videoroom");
    } catch (error) {
      this.logger.log("JanusInit:", error);
    }
  }

  async createRoom(id: number, pin: string, secret: string) {
    await this.pluginHandle?.sendWithTransaction({
      body: { request: "create", room: id, pin: pin, secret: secret },
    });
  }

  async destroyRoom(id: number, secret: string) {
    await this.pluginHandle?.sendWithTransaction({
      body: { request: "destroy", room: id, secret: secret },
    });
  }

  async findManyByLawyer(uid: string) {
    return this.events
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.owner", "user")
      .leftJoinAndSelect("event.participants", "participant")
      .where("event.owner_id = :uid", { uid })
      .getMany();
  }

  async findEvent(eid: string) {
    return this.events.findOneOrFail(eid, {
      relations: ["files", "owner", "participants"],
    });
  }

  async findEventByRoom(rid: string) {
    return this.events.findOneOrFail({
      where: { roomId: rid },
      relations: ["files", "owner", "participants"],
    });
  }

  async findAllEvents() {
    return this.events.find({ relations: ["files", "owner", "participants"] });
  }


  async findAllPendingEvents() {
    return this.pEvents.find({ relations: ["from", "lawyer"] });
  }

  async findPendingEvents(uid: string) {
    return this.pEvents
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.from", "user")
      .where("event.lawyer_id = :uid", { uid })
      .orWhere("event.lawyer_id IS NULL")
      .getMany();
  }

  async findPendingEventByUser(uid: string) {
    return this.pEvents
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.lawyer", "lawyer")
      .leftJoinAndSelect("event.from", "from")
      .where("event.from_id = :uid", { uid })
      .getOneOrFail();
  }

  private counter = 0;

  async transferEvent(eid: string, lid: string) {
    const pending = await this.pEvents.findOne(eid, {
      relations: ["from", "participants"],
    });
    const event = new CalendarEvent() as DeepPartial<CalendarEvent>;
    event.id = (Math.floor((new Date().getTime() - new Date(2020, 0).getTime()) / 1000) << 4) + ((this.counter++ % 16));
    event.title = `Meeting with ${pending.from.first_name} ${pending.from.last_name}`;
    event.description = pending.description;
    event.start_timestamp = pending.start_timestamp;
    event.end_timestamp = pending.end_timestamp;
    event.owner = { id: +lid };
    event.roomAccess = RoomAccess.ONLY_PARTICIPANTS;
    event.roomId = event.id;
    event.roomPassword = "";
    event.roomSecret = "";
    for (let i = 0; i < 6; i++) {
      event.roomPassword += genChar();
      event.roomSecret += genChar();
    }
    event.participants = pending.participants;
    event.roomStatus = Status.NEW;

    //await this.createRoom(event.roomId, event.roomPassword, event.roomSecret)
    await this.events.save(event);
    return this.pEvents.delete(eid);
  }

  async deleteRequestEvent(eid: string) {
    return this.pEvents.delete(eid);
  }

  async updateStatus(eid: string, status: Status) {
    const event = await this.events.findOne(eid);
    event.roomStatus = status;
    return this.events.save(event);
  }

  async createEvent(
    data: CreateEventDto & { user_id: string }
  ): Promise<CalendarEvent> {
    const event = new CalendarEvent() as DeepPartial<CalendarEvent>;
    event.id = (Math.floor((new Date().getTime() - new Date(2020, 0).getTime()) / 1000) << 4) + ((this.counter++ % 16));
    event.title = data.title;
    event.description = data.description;
    event.start_timestamp = new Date(data.timespan_start);
    event.end_timestamp = new Date(data.timespan_end);
    event.owner = { id: Number(data.user_id) };
    event.roomAccess = data.room_access ?? 0;
    event.roomId = event.id;
    event.roomPassword = "";
    event.roomSecret = "";
    for (let i = 0; i < 6; i++) {
      event.roomPassword += genChar();
      event.roomSecret += genChar();
    }
    event.participants = (data.participants ?? []).map((id) => ({
      id: Number(id),
    }));
    event.roomStatus = Status.NEW;

    return this.events.save(event);
  }

  async updateEvent(eventId: string, data: PatchEventDto) {
    const model = (await this.events.findOne(
      eventId
    )) as Partial<CalendarEvent>;
    if ("timespan_start" in data) {
      model.start_timestamp = new Date(data.timespan_start);
    }
    if ("timespan_end" in data) {
      model.end_timestamp = new Date(data.timespan_end);
    }
    if ("title" in data) {
      model.title = data.title;
    }
    if ("description" in data) {
      model.description = data.description;
    }
    if ("participants" in data) {
      model.participants = (data.participants.map((id) => ({
        id: +id,
      })) as unknown) as User[];
    }
    if ("room_access" in data) {
      model.roomAccess = data.room_access;
    }

    await this.events.save(model);
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
    event.participants = data.additional_ids.map((id) => ({ id: +id }));

    return this.pEvents.save(event);
  }
}
