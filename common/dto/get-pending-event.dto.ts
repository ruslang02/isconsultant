import { GetUserInfoDto } from "./get-user-info.dto";

export class GetPendingEventDto {
  id: string;
  from: GetUserInfoDto;
  timespan_start: string;
  timespan_end: string;
  description: string;
  participants: string[];
  lawyer_id?: string;
}