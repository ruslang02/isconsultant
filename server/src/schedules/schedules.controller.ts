import { CreateEventDto } from "@common/dto/create-event.dto";
import { GetEventDto } from "@common/dto/get-event.dto";
import { GetPendingEventDto } from "@common/dto/get-pending-event.dto";
import { PatchEventDto } from "@common/dto/patch-event.dto";
import { UserType } from "@common/models/user.entity";
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ArrangeEventDto } from "@common/dto/arrange-event.dto";
import { Response as EResponse } from "express";
import { createReadStream } from "fs";
import { JwtAuthGuard } from "guards/jwt.guard";
import { Types } from "guards/type.decorator";
import { UserGuard } from "guards/user.guard";
import { ExtendedRequest } from "utils/ExtendedRequest";
import { SchedulesService } from "./schedules.service";
import { myStorage } from "./storage.multer";
import { StorageService } from "./storage.service";
import { CalendarEvent } from "/home/ruzik/Projects/isc/common/models/calendar-event.entity";

@ApiTags("Управление личным календарем")
@Controller("/api/events")
export class SchedulesController {
  constructor(
    private schedules: SchedulesService,
    private storage: StorageService
  ) {}

  @Types(UserType.ADMIN, UserType.MODERATOR, UserType.LAWYER)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Get("requests")
  @ApiBearerAuth()
  @ApiOperation({
    description:
      "Создание заявку на создание события в календаре текущего пользователя.",
  })
  async getPendingEvents(
    @Request() { user }: ExtendedRequest,
  ): Promise<GetPendingEventDto[]> {
    const events = await this.schedules.findPendingEvents(user.id.toString());
    return events.map((e) => ({
      id: e.id.toString(),
      from: {
        ...e.from,
        created_timestamp: undefined
      },
      description: e.description,
      participants: e.participants?.map(p => p.id.toString()),
      timespan_start: e.start_timestamp.toISOString(),
      timespan_end: e.start_timestamp.toISOString(),
    }))
  }

  @Types(UserType.ADMIN, UserType.MODERATOR)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Get("/all")
  @ApiOkResponse({
    description: "Возвращены все события в календаре.",
  })
  @ApiBearerAuth()
  @ApiOperation({
    description: "Получение событий (встреч).",
  })
  async getAllEvents(
    @Request() { user }: ExtendedRequest
  ) {
    try {
      const events = await this.schedules.findAllEvents();
      return events?.map(this.eventModelToDto);
    } catch (e) {
      console.log(e);
      throw new NotFoundException();
    }
  }

  private eventModelToDto(event: CalendarEvent): GetEventDto {
    return {
      id: event.id.toString(),
      description: event.description,
      owner: event.description,
      participants: (event.participants ?? []).map((p) => p.id.toString()),
      room_access: event.roomAccess,
      room_id: event.roomId,
      timespan_end: event.end_timestamp.toISOString(),
      timespan_start: event.start_timestamp.toISOString(),
      title: event.title,
      room_password: event.roomPassword,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put("/")
  createEvent(
    @Request() { user }: ExtendedRequest,
    @Body() data: CreateEventDto
  ) {
    return this.schedules.createEvent({
      ...data,
      user_id: user?.id.toString(),
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("/")
  async getEvents(
    @Request() { user }: ExtendedRequest
  ) {
    try {
      const events = await this.schedules.findManyByLawyer(user.id.toString());
      return events.map(this.eventModelToDto);
    } catch (e) {
      console.log(e);
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("/:eid")
  async getEvent(@Param("eid") eid: string): Promise<GetEventDto> {
    try {
      const event = await this.schedules.findEvent(eid);
      console.log(event);
      return this.eventModelToDto(event);
    } catch (e) {
      console.log(e);
      throw new NotFoundException();
    }
  }

  @Types(UserType.LAWYER)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Patch("/:eid")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Изменение информации о событии.",
  })
  patchEvent(@Param("eid") eventId: string, @Body() data: PatchEventDto) {
    return this.schedules.updateEvent(eventId, data);
  }

  @Types(UserType.LAWYER)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Delete("/:eid")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Удаление события.",
  })
  deleteEvent(@Param("eid") eventId: string) {
    this.schedules.deleteEvent(eventId);
  }

  @Get("/:eid/files/:fid/:fname")
  @ApiOperation({
    description: "Получение файла, загруженного в рамках этого события.",
  })
  async getFile(
    @Param("fid") fileId: string,
    @Param("fname") filename: string,
    @Response() res: EResponse
  ) {
    try {
      const file = await this.storage.get(fileId);
      res.setHeader("Content-type", "application/octet-stream");
      res.setHeader("Content-disposition", "attachment");
      res.setHeader("filename", filename);
      createReadStream(file.path).pipe(res);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Types(UserType.LAWYER, UserType.CLIENT)
  @UseGuards(JwtAuthGuard)
  @Get("/:eid/files")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Получение файла, загруженного в рамках этого события.",
  })
  async getFilesForEvent(@Param("fid") fileId: string) {
    return (await this.schedules.findEvent(fileId)).files;
  }

  @Types(UserType.LAWYER, UserType.CLIENT)
  @UseGuards(JwtAuthGuard)
  @Post("/:eid/files/")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: myStorage,
    })
  )
  @ApiBearerAuth()
  @ApiOperation({
    description: "Получение файла, загруженного в рамках этого события.",
  })
  uploadFile(
    @Param("eid") eventId: string,
    @Query("name") fileName: string,
    @Request() { user }: ExtendedRequest,
    @UploadedFile() file?: Express.Multer.File
  ) {
    this.storage.create(fileName, file?.filename, user.id.toString(), eventId);
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Post("request")
  @ApiBearerAuth()
  @ApiOperation({
    description:
      "Создание заявку на создание события в календаре текущего пользователя.",
  })
  requestEvent(
    @Request() { user }: ExtendedRequest,
    @Body() data: ArrangeEventDto
  ) {
    this.schedules.createPendingEvent({
      ...data,
      user_id: user.id.toString(),
    });
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Post("request/accept")
  @ApiBearerAuth()
  @ApiOperation({
    description:
      "Создание заявку на создание события в календаре текущего пользователя.",
  })
  acceptRequestEvent(
    @Request() { user }: ExtendedRequest,
    @Body() data: { id: string }
  ) {
    this.schedules.transferEvent(data.id);
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Post("request/decline")
  @ApiBearerAuth()
  @ApiOperation({
    description:
      "Создание заявку на создание события в календаре текущего пользователя.",
  })
  declineRequestEvent(
    @Request() { user }: ExtendedRequest,
    @Body() data: { id: string }
  ) {
    this.schedules.deleteRequestEvent(data.id);
  }
}
