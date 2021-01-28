export class CreateEventDto {
  title: string;
  description: string;
  timespan_start: string;
  timespan_end: string;
  participants: string[];
}