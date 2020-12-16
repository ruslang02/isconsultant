import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Управление личным календарем')
@Controller('/api/schedules')
export class SchedulesController {
  
}
