import { CreateEventDto } from "@common/dto/create-event.dto";
import { GetEventDto } from "@common/dto/get-event.dto";
import { GetPendingEventDto } from "@common/dto/get-pending-event.dto";
import { PatchEventDto } from "@common/dto/patch-event.dto";
import { UserType } from "@common/models/user.entity";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Header,
  Inject,
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
import { CalendarEvent } from "@common/models/calendar-event.entity";
import { UsersService } from "users/users.service";
import { EventAdapter } from "./event.adapter";
import { I18n, I18nContext } from "nestjs-i18n";
import { PendingEventAdapter } from "./pending-event.adapter";
import { ChatGateway } from "chat/chat.gateway";
import { ChatService } from "chat/chat.service";

@ApiTags("Управление личным календарем")
@Controller("/api/events")
export class SchedulesController {
  constructor(
    private schedules: SchedulesService,
    private storage: StorageService,
    private users: UsersService,
    private adapter: EventAdapter,
    private pAdapter: PendingEventAdapter,
    @Inject(forwardRef(() => ChatService))
    private chat: ChatService
  ) { }

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
    @I18n() i18n: I18nContext
  ): Promise<GetPendingEventDto[]> {
    const events = await this.schedules.findPendingEvents(user.id.toString());
    return Promise.all(events.map(this.pAdapter.transform(i18n)))
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
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ) {
    try {
      const events = await this.schedules.findAllEvents();
      return Promise.all(events.map(this.adapter.transform(true, i18n)));
    } catch (e) {
      console.log(e);
      throw new NotFoundException();
    }
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

  @Types(UserType.ADMIN, UserType.MODERATOR, UserType.LAWYER)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("/")
  async getEvents(
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ) {
    try {
      const events = await this.schedules.findManyByLawyer(user.id.toString());
      return Promise.all(events.map(this.adapter.transform(true, i18n)));
    } catch (e) {
      console.log(e);
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("/@me")
  async getMyEvents(
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ) {
    try {
      const events = await this.users.findEvents(user.id.toString());
      return Promise.all(events.map(this.adapter.transform(false, i18n)));
    } catch (e) {
      console.log(e);
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("/:eid")
  async getEvent(
    @Param("eid") eid: string,
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ): Promise<GetEventDto> {
    try {
      const event = await this.schedules.findEvent(eid);
      console.log(event);
      return this.adapter.transform(user.type !== UserType.CLIENT, i18n)(event);
    } catch (e) {
      console.log(e);
      throw new NotFoundException();
    }
  }

  @Types(UserType.LAWYER, UserType.ADMIN, UserType.MODERATOR)
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

  @Get("/:eid/log/json")
  async getChatLogJSON(@Param("eid") eventId: string) {
    try {
      return this.chat.getForEvent(eventId);
    } catch (e) {
      throw new BadRequestException("The event does not exist or the chat log is empty.");
    }
  }

  @Get(["/:eid/log/text", "/:eid/log/text/:fname"])
  @Header('Content-Type', 'application/octet-stream')
  async getChatLogText(@Param("eid") eventId: string) {
    try {
      const event = await this.schedules.findEvent(eventId);
      const messages = await this.chat.getForEvent(eventId, true);
      return `Log from meeting "${event.title}", meeting moderator: ${event.owner.first_name} ${event.owner.last_name}:

` + messages.map(_ => (`${_.from.first_name} ${_.from.last_name} (${_.from.type}) sent in ${_.created_timestamp.toString()}:
${_.content}
`)).join("\n") + "\nEnd of log"
    } catch (e) {
      throw new BadRequestException("The event does not exist or the chat log is empty.");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:eid/files")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Получение файла, загруженного в рамках этого события.",
  })
  async getFilesForEvent(@Param("eid") eventId: string) {
    return this.storage.list(eventId);
  }

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
  async requestEvent(
    @Request() { user }: ExtendedRequest,
    @Body() data: ArrangeEventDto
  ) {
    try {
      await this.schedules.createPendingEvent({
        ...data,
        user_id: user.id.toString(),
      });
    } catch (e) {
      throw new BadRequestException("You have already sent a meeting request. Please wait for it to be either declined or accepted and try again later.");
    }
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
    this.schedules.transferEvent(data.id, user.id.toString());
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
