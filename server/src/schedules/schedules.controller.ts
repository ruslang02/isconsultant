import { CreateEventDto } from "@common/dto/create-event.dto";
import { GetEventDto } from "@common/dto/get-event.dto";
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
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,

  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { Response as EResponse } from "express";
import { createReadStream } from "fs";
import { JwtAuthGuard } from "guards/jwt.guard";
import { Types } from "guards/type.decorator";
import { UserGuard } from "guards/user.guard";
import { ExtendedRequest } from "utils/ExtendedRequest";
import { SchedulesService } from "./schedules.service";
import { myStorage } from "./storage.multer";
import { StorageService } from "./storage.service";

@ApiTags("Управление личным календарем")
@Controller("/api/events")
export class SchedulesController {
  constructor(
    private schedules: SchedulesService,
    private storage: StorageService
  ) { }
  /*
    @UseGuards(JwtAuthGuard, UserGuard)
    @Get(":uid/events")
    @ApiOkResponse({
      description: "Возвращены события в календаре для данного пользователя.",
    })
    @ApiBearerAuth()
    @ApiOperation({
      description: "Получение событий для данного пользователя.",
    })
    getEvents(@Param("uid") userId: string) {
      return this.schedules.findManyByUser(userId);
    }
  */

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
  @Get("/:eid")
  async getEvent(
    @Param("eid") eid: string
  ): Promise<GetEventDto> {
    try {
      const event = await this.schedules.findEvent(eid);
      console.log(event);
      return {
        id: event.id.toString(),
        description: event.description,
        owner: event.description,
        participants: (event.participants ?? []).map(p => p.id.toString()),
        room_access: event.roomAccess,
        room_id: event.roomId,
        timespan_end: event.end_timestamp.toISOString(),
        timespan_start: event.start_timestamp.toISOString(),
        title: event.title,
        room_password: event.roomPassword,
      };
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
      res.setHeader("filename", filename)
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
  async getFilesForEvent(
    @Param("fid") fileId: string
  ) {
    return (await this.schedules.findEvent(fileId)).files;
  }

  @Types(UserType.LAWYER, UserType.CLIENT)
  @UseGuards(JwtAuthGuard)
  @Post("/:eid/files/")
  @UseInterceptors(FileInterceptor('file', {
    storage: myStorage
  }))
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
  /*
    @UseGuards(JwtAuthGuard, UserGuard)
    @Post(":uid/arrange")
    @ApiBearerAuth()
    @ApiOperation({
      description:
        "Создание заявку на создание события в календаре текущего пользователя.",
    })
    arrangeEvent(
      @Request() { user }: ExtendedRequest,
      @Param("uid") lawyerId: string,
      @Body() data: ArrangeEventDto
    ) {
      this.schedules.createPendingEvent({
        ...data,
        lawyer_id: lawyerId.toString(),
        user_id: user.id.toString(),
      });
    }
  */
}
