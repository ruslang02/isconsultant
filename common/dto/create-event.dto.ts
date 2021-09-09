import { RoomAccess } from "../models/calendar-event.entity";

export class CreateEventDto {
    title: string;
    description: string;
    timespan_start: string;
    timespan_end: string;
    participants: string[];
    room_access?: RoomAccess;
}