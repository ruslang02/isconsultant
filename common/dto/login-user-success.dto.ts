export class LoginUserSuccessDto {
  access_token: string;
  user: {
    id: number;
    type: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    avatar?: string;
  };
}
