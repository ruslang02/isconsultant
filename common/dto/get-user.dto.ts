import { GetUserInfoDto } from './get-user-info.dto';

export class GetUserDto extends GetUserInfoDto {
  phone?: string;
  email: string;
  educationText: string
  experienceText: string
  specialtyText: string
}
