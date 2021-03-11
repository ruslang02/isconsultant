export class GetUserInfoDto {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  type: string;
  type_localized: string;
  avatar?: string;
  verified: boolean;
  rating: number;
  created_timestamp: string;
}
