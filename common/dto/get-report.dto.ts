import { GetUserDto } from "./get-user.dto";

export class GetReportDto {
    id: string;
    created_timestamp: string;
    status: string;
    status_localized: string;
    decision: string;
    author: GetUserDto;
    receiver: GetUserDto;
    description: string;
}