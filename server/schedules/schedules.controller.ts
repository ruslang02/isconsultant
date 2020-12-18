import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from 'server/guards/user.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { SchedulesService } from './schedules.service';

@ApiTags('Управление личным календарем')
@Controller('/api/schedules')
export class SchedulesController {
  constructor(
    private schedules: SchedulesService,
  ) {}

  @UseGuards(JwtAuthGuard, UserGuard)
  @Get(':id')
  @ApiOkResponse({
    description: 'Возвращены события в календаре для данного пользователя.'
  })
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Получение событий для данного пользователя.'
  })
  getEvents(
    @Param('id') userId: string
  ) {
    return this.schedules.findManyByUser(userId);
  }
}
