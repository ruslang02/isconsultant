import { GetEventDto } from "./get-event.dto";
import { GetUserDto } from "./get-user.dto";

export type PatchEventDto = Partial<Omit<GetEventDto, "id">>;