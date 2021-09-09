import { GetPendingEventDto } from "@common/dto/get-pending-event.dto";
import { PendingEvent } from "@common/models/pending-event.entity";
import { Injectable } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { UserAdapter } from "users/user.adapter";

@Injectable()
export class PendingEventAdapter {
    constructor(public userAdapter: UserAdapter) { }

    public transform(i18n: I18nContext) {
        return async (event: PendingEvent): Promise<GetPendingEventDto> => ({
            id: event.id.toString(),
            from: await this.userAdapter.transform(event.from, i18n),
            lawyer: event.lawyer ? await this.userAdapter.transform(event.lawyer, i18n) : null,
            description: event.description,
            participants: event.participants?.map(p => p.id.toString()),
            timespan_start: event.start_timestamp.toISOString(),
            timespan_end: event.start_timestamp.toISOString(),
        });
    }
}