import { CalendarEvent } from '@common/models/CalendarEvent';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(CalendarEvent)
    private events: Repository<CalendarEvent>
  ) {}

  findManyByUser(uid: string) {
    return this.events
      .createQueryBuilder('event')
      .where('event.author_id = :uid', { uid })
      .getMany();
  }
}
