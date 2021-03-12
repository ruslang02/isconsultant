import { GetUserDto } from "./get-user.dto";
import { PatchEventDto } from "./patch-event.dto";

export class GetEventDto extends PatchEventDto {
  id: string;
}