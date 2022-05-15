import { ApiProperty } from "@nestjs/swagger";
import { CalendarEvent } from "./calendar-event.entity";
import { User } from "./user.entity";

export class ChatMessage {
    @ApiProperty({
        description: "Уникальный идентификатор сообщения.",
    })
    id: string;

    from: User;

    event: CalendarEvent;

    content: string;

    created_timestamp: Date;
}