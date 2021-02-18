export class GetEventDto {
  id: string;
  title: string;
  description: string;
  timespan_start: string;
  timespan_end: string;
  participants: string[];
  owner: string;
  room_id: number;
  room_access: number;
  room_password: string;
}