import { GetEventDto } from "@common/dto/get-event.dto";
import { CalendarEvent } from "@common/models/calendar-event.entity";
import { Injectable } from "@nestjs/common";
import { I18n, I18nContext } from "nestjs-i18n";
import { UserAdapter } from "users/user.adapter";

@Injectable()
export class EventAdapter {
  constructor(public userAdapter: UserAdapter) { }

  public transform(showSecret: boolean, i18n: I18nContext) {
    return async (event: CalendarEvent): Promise<GetEventDto> => ({
      id: event.id.toString(),
      description: event.description,
      owner: await this.userAdapter.transform(event.owner, i18n),
      participants: (event.participants ?? []).map((p) => p.id.toString()),
      room_access: event.roomAccess,
      room_secret: showSecret ? event.roomSecret : undefined,
      room_id: event.roomId,
      timespan_end: event.end_timestamp.toISOString(),
      timespan_start: event.start_timestamp.toISOString(),
      title: event.title,
      room_password: event.roomPassword,
    });
  }
}