import { GetUserDto } from "./get-user.dto";

export class PatchEventDto {
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
}