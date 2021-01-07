export class ArrangeEventDto {
  timespan_start: string;
  timespan_end: string;
  description: string;
  lawyer_id?: string;
  additional_ids: string[];
}