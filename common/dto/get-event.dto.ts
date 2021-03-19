import { Status } from "../models/calendar-event.entity";
import { GetUserDto } from "./get-user.dto";
import { PatchEventDto } from "./patch-event.dto";

export class GetEventDto {
  id: string;
  title: string;
  description: string;
  timespan_start: string;
  timespan_end: string;
  participants: string[];
  owner: GetUserDto;
  room_id: number;
  room_access: number;
  room_secret: string;
  room_password: string;
  room_status: Status;
}