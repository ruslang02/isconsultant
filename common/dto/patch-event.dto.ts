import { GetEventDto } from "./get-event.dto";

export type PatchEventDto = Partial<Omit<GetEventDto, "id">>;