import { TimeSlot } from "../models/time-slot.entity";
import { GetUserInfoDto } from "./get-user-info.dto";

export class GetUserDto extends GetUserInfoDto {
    phone?: string;
    email: string;
    educationText: string;
    experienceText: string;
    specialtyText: string;
    time_slots: TimeSlot[];
}
