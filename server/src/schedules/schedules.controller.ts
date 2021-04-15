import { CreateEventDto } from "@common/dto/create-event.dto";
import { GetEventDto } from "@common/dto/get-event.dto";
import { GetPendingEventDto } from "@common/dto/get-pending-event.dto";
import { PatchEventDto } from "@common/dto/patch-event.dto";
import { User, UserType } from "@common/models/user.entity";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
  UnauthorizedException,
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
import { UsersService } from "users/users.service";
import { EventAdapter } from "./event.adapter";
import { I18n, I18nContext } from "nestjs-i18n";
import { PendingEventAdapter } from "./pending-event.adapter";
import { ChatService } from "chat/chat.service";
import { RoomAccess, Status } from "@common/models/calendar-event.entity";
import { OptionalJwtAuthGuard } from "guards/optional-jwt.guard";

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
    description: "Получить все заявки, доступные данному юристу.",
  })
  async getPendingEvents(
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ): Promise<GetPendingEventDto[]> {
    const events = await this.schedules.findPendingEvents(user.id.toString());
    return Promise.all(events.map(this.pAdapter.transform(i18n)));
  }

  @UseGuards(JwtAuthGuard)
  @Get("requests/@me")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Получить заявку, отправленную текущим пользователем.",
  })
  async getMyPendingEvent(
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ): Promise<GetPendingEventDto> {
    try {
      const event = await this.schedules.findPendingEventByUser(
        user.id.toString()
      );
      return this.pAdapter.transform(i18n)(event);
    } catch (e) {
      console.error(e);
      throw new NotFoundException("No event registered from current user.");
    }
  }

  @Types(UserType.ADMIN, UserType.MODERATOR)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Get("requests/all")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Получить все заявки в системе.",
  })
  async getAllPendingEvents(
    @I18n() i18n: I18nContext
  ): Promise<GetPendingEventDto[]> {
    const events = await this.schedules.findAllPendingEvents();
    return Promise.all(events.map(this.pAdapter.transform(i18n)));
  }

  @Types(UserType.ADMIN, UserType.MODERATOR)
  @UseGuards(JwtAuthGuard, UserGuard)
  @Get("/all")
  @ApiOkResponse({
    description: "Возвращены все события в календаре.",
  })
  @ApiBearerAuth()
  @ApiOperation({
    description: "Получение событий (встреч) от всех пользователей системы.",
  })
  async getAllEvents(
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ) {
    try {
      const events = await this.schedules.findAllEvents();
      return Promise.all(events.map(this.adapter.transform(true, true, i18n)));
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put("/")
  @ApiOperation({
    description: "Создание нового события в календаре.",
  })
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
  @ApiOperation({
    description: "Получение событий (встреч), доступных данному юристу.",
  })
  async getEvents(
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ) {
    try {
      const events = await this.schedules.findManyByLawyer(user.id.toString());
      return Promise.all(events.map(this.adapter.transform(true, true, i18n)));
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("/@me")
  @ApiOperation({
    description:
      "Получение событий (встреч), в которых участвует пользователь.",
  })
  async getMyEvents(
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ) {
    try {
      const events = await this.users.findEvents(user.id.toString());
      return Promise.all(events.map(this.adapter.transform(false, true, i18n)));
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get("/:eid")
  @ApiOperation({
    description: "Получение информации о событии.",
  })
  async getEvent(
    @Param("eid") eid: string,
    @Request() { user }: ExtendedRequest,
    @I18n() i18n: I18nContext
  ): Promise<GetEventDto> {
    try {
      const event = await this.schedules.findEvent(eid);
      const participantsId = event.participants.map((user) => user.id);

      if (event.roomAccess === RoomAccess.ONLY_PARTICIPANTS) {
        if (!user) {
          throw new ForbiddenException();
        }
        if (user.type === UserType.CLIENT || user.type === UserType.LAWYER) {
          if (!participantsId.includes(user.id) && event.owner.id !== user.id) {
            throw new ForbiddenException();
          }
        }
      }

      const showSecret =
        [UserType.MODERATOR, UserType.ADMIN].includes(user.type) ||
        (user.type === UserType.LAWYER && event.owner.id === user.id);

      const showPin =
        showSecret ||
        (participantsId.includes(user.id));

      return this.adapter.transform(showSecret, showPin, i18n)(event);
    } catch (e) {
      console.error(e);
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

  @Types(UserType.LAWYER, UserType.ADMIN, UserType.MODERATOR)
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
      const stream = createReadStream(file.path)
      stream.on('error', () => {
        res.status(404).send("{\"message\": \"File was not found.\"}");
      });
      stream.pipe(res)
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Get("/:eid/log/json")
  @ApiOperation({
    description:
      "Получение текстовой записи всех сообщений данной встречи в формате JSON.",
  })
  async getChatLogJSON(@Param("eid") eventId: string) {
    try {
      return this.chat.getForEvent(eventId, true);
    } catch (e) {
      throw new BadRequestException(
        "The event does not exist or the chat log is empty."
      );
    }
  }

  @Get(["/:eid/log/text", "/:eid/log/text/:fname"])
  @Header("Content-Type", "application/octet-stream")
  @ApiOperation({
    description:
      "Получение текстовой записи всех сообщений данной встречи в формате текстового файла.",
  })
  async getChatLogText(@Param("eid") eventId: string) {
    try {
      const event = await this.schedules.findEvent(eventId);
      const messages = await this.chat.getForEvent(eventId, true);
      return (
        `Log from meeting "${event.title}", meeting moderator: ${event.owner.first_name} ${event.owner.last_name}:

` +
        messages
          .map(
            (_) => `${_.from.first_name} ${_.from.last_name} (${_.from.type
              }) sent in ${_.created_timestamp.toString()}:
${_.content}
`
          )
          .join("\n") +
        "\nEnd of log"
      );
    } catch (e) {
      throw new BadRequestException(
        "The event does not exist or the chat log is empty."
      );
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
  async uploadFile(
    @Param("eid") eventId: string,
    @Query("name") fileName: string,
    @Request() { user }: ExtendedRequest,
    @UploadedFile() file?: Express.Multer.File
  ) {
    await this.storage.create(
      fileName,
      file?.filename,
      user.id.toString(),
      eventId
    );
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
    if (!data.description) {
      throw new BadRequestException("You did not specify request's description.");
    }
    try {
      await this.schedules.createPendingEvent({
        ...data,
        user_id: user.id.toString(),
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException(
        "You have already sent a meeting request. Please wait for it to be either declined or accepted and try again later."
      );
    }
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Post("request/accept")
  @ApiBearerAuth()
  @ApiOperation({
    description:
      "Создание заявку на создание события в календаре текущего пользователя.",
  })
  async acceptRequestEvent(
    @Request() { user }: ExtendedRequest,
    @Body() data: { id: string }
  ) {
    await this.schedules.transferEvent(data.id, user.id.toString());
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Post("request/decline")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Удаление заявки на создание встречи.",
  })
  async declineRequestEvent(
    @Request() { user }: ExtendedRequest,
    @Body() data: { id: string }
  ) {
    await this.schedules.deleteRequestEvent(data.id);
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Post("/:eid/start")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Создание комнаты для видеозвонка.",
  })
  async startRoom(
    @Request() { user }: ExtendedRequest,
    @Param("eid") id: string
  ) {
    const event = await this.schedules.findEvent(id);
    if (user.id == event.owner.id
      || [UserType.MODERATOR, UserType.ADMIN].includes(user.type)) {
      await this.schedules.createRoom(
        event.roomId,
        event.roomPassword,
        event.roomSecret
      );
      return this.schedules.updateStatus(id, Status.STARTED);
    }

    throw new ForbiddenException();
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Post("/:eid/stop")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Удаление комнаты для видеозвонка.",
  })
  async stopRoom(
    @Request() { user }: ExtendedRequest,
    @Param("eid") id: string
  ) {
    const event = await this.schedules.findEvent(id);
    if (user.id == event.owner.id
      || [UserType.MODERATOR, UserType.ADMIN].includes(user.type)) {
      await this.schedules.destroyRoom(event.roomId, event.roomSecret);
      return this.schedules.updateStatus(id, Status.NEW);
    }

    return this.schedules.destroyRoom(event.roomId, event.roomSecret);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:eid/:password")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Получение данных о событии по паролю.",
  })
  async getEventByPassword(
    @Request() { user }: ExtendedRequest,
    @Param("eid") id: string,
    @Param("password") pin: string,
    @I18n() i18n: I18nContext
  ) {
    const event = await this.schedules.findEvent(id);
    if (
      event.roomAccess === RoomAccess.ONLY_PARTICIPANTS ||
      event.roomPassword != pin
    ) {
      throw new ForbiddenException();
    }

    const ids = event.participants.map(user => user.id.toString());
    if (!(ids.includes(user.id.toString()) || event.owner.id == user.id)) {
      await this.schedules.updateEvent(id, { participants: [...ids, user.id.toString()] });
    }

    return this.adapter.transform(false, true, i18n)(event);
  }
}
