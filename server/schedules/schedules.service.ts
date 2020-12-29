import { ArrangeEventDto } from '@common/dto/ArrangeEvent';
import { CalendarEvent } from '@common/models/CalendarEvent';
import { PendingEvent } from '@common/models/PendingEvent';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'server/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(CalendarEvent)
    private events: Repository<CalendarEvent>,
    @InjectRepository(PendingEvent)
    private pEvents: Repository<PendingEvent>,
    private users: UsersService
  ) {}

  findManyByUser(uid: string) {
    return this.events
      .createQueryBuilder('event')
      .where('event.author_id = :uid', { uid })
      .getMany();
  }

  async createPendingEvent(data: ArrangeEventDto & { user_id: string }) {
    const event = new PendingEvent();
    event.description = data.description;
    event.start_timestamp = new Date(data.timespan_start);
    event.end_timestamp = new Date(data.timespan_end);
    event.from = await this.users.findOne(data.user_id);

    const promises = data.additional_ids.map((id) => this.users.findOne(id));

    event.participants = await Promise.all(promises);

    this.pEvents.create(event);
  }
}
