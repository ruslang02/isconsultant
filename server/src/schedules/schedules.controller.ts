import { ArrangeEventDto } from '@common/dto/arrange-event.dto';
import { CreateEventDto } from '@common/dto/create-event.dto';
import { PatchEventDto } from "@common/dto/patch-event.dto";
import { UserType } from "@common/models/user.entity";
import {
  Body,
  Controller,
  Delete,

  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { Types } from "guards/type.decorator";
import { JwtAuthGuard } from 'guards/jwt.guard';
import { UserGuard } from 'guards/user.guard';
import { ExtendedRequest } from 'utils/ExtendedRequest';
import { SchedulesService } from './schedules.service';

@ApiTags('Управление личным календарем')
@Controller('/api/schedules')
export class SchedulesController {
  constructor(private schedules: SchedulesService) {}

  @UseGuards(JwtAuthGuard, UserGuard)
  @Get(':uid/events')
  @ApiOkResponse({
    description: 'Возвращены события в календаре для данного пользователя.',
  })
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Получение событий для данного пользователя.',
  })
  getEvents(@Param('uid') userId: string) {
    return this.schedules.findManyByUser(userId);
  }

  @Put(':uid/events')
  createEvent(
    @Request() { user }: ExtendedRequest,
    @Body() data: CreateEventDto,
  ) {
    return this.schedules.createEvent({
      ...data,
      user_id: user.id.toString(),
    });
  }

  @Types(UserType.LAWYER)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Patch(':uid/events/:eid')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Изменение информации о событии.',
  })
  patchEvent(
    @Param('eid') eventId: string,
    @Body() data: PatchEventDto
  ) {
    return this.schedules.updateEvent(eventId, data);
  }

  @Types(UserType.LAWYER)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Delete(':uid/events/:eid')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Удаление события.',
  })
  deleteEvent(
    @Param('eid') eventId: string
  ) {
    this.schedules.deleteEvent(eventId);
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Post(':uid/arrange')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Создание заявку на создание события в календаре текущего пользователя.',
  })
  arrangeEvent(
    @Request() { user }: ExtendedRequest,
    @Param('uid') lawyerId: string,
    @Body() data: ArrangeEventDto
  ) {
    this.schedules.createPendingEvent({
      ...data,
      lawyer_id: lawyerId.toString(),
      user_id: user.id.toString(),
    });
  }
}
