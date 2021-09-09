import { GetUserDto } from "./get-user.dto";

export class LoginUserSuccessDto {
    access_token: string;
    user: GetUserDto;
}
