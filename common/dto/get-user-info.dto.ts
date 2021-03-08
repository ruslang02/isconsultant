export class GetUserInfoDto {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  type: string;
  avatar?: string;
  verified: boolean;
  rating: number;
  created_timestamp: string;
}
