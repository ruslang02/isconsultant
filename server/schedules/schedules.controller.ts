import { ArrangeEventDto } from '@common/dto/ArrangeEvent';
import { PendingEvent } from '@common/models/PendingEvent';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserGuard } from 'server/guards/user.guard';
import { ExtendedRequest } from 'server/utils/ExtendedRequest';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { SchedulesService } from './schedules.service';

@ApiTags('Управление личным календарем')
@Controller('/api/schedules')
export class SchedulesController {
  constructor(private schedules: SchedulesService) {}

  @UseGuards(JwtAuthGuard, UserGuard)
  @Get(':id')
  @ApiOkResponse({
    description: 'Возвращены события в календаре для данного пользователя.',
  })
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Получение событий для данного пользователя.',
  })
  getEvents(@Param('id') userId: string) {
    return this.schedules.findManyByUser(userId);
  }

  @Post('arrange')
  arrangeEvent(
    @Request() request: ExtendedRequest,
    @Body() data: ArrangeEventDto
  ) {
    this.schedules.createPendingEvent({
      ...data,
      user_id: request.user.id.toString(),
    });
  }
}
