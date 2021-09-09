import { GetUserInfoDto } from "@common/dto/get-user-info.dto";
import { GetUserDto } from "@common/dto/get-user.dto";
import { PatchUserVerifiedDto } from "@common/dto/patch-user-verified.dto";
import { PatchUserDto } from "@common/dto/patch-user.dto";
import { TimeSlot } from "@common/models/time-slot.entity";
import { User, UserType } from "@common/models/user.entity";
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { LoggerService } from "logger/logger.interface";
import { I18n, I18nContext } from "nestjs-i18n";
import { SchedulesService } from "schedules/schedules.service";
import { In, Repository } from "typeorm";
import { JwtAuthGuard } from "../guards/jwt.guard";
import { Types } from "../guards/type.decorator";
import { UserGuard } from "../guards/user.guard";
import { ExtendedRequest } from "../utils/ExtendedRequest";
import { UserAdapter } from "./user.adapter";
import { UsersService } from "./users.service";

@ApiTags("Управление пользователями")
@Controller("/api/users")
export class UsersController {
    constructor(
        private users: UsersService,
        private adapter: UserAdapter,
        @InjectRepository(TimeSlot)
        private slots: Repository<TimeSlot>,
        private schedules: SchedulesService,
        @Inject("Logger")
        private logger: LoggerService,
    ) {}

    @Get("search")
    @ApiOperation({
        description: "Поиск пользователей.",
    })
    async searchUsers(@I18n() i18n: I18nContext,
        @Query("query") query?: string,
        @Query("ids") ids?: string
    ) {
        const users = query
            ? await this.users.search(query).catch(() => {
                this.logger.error
            })
            : ids
                ? await this.users.findMany({ where: { id: In(ids.split(",")) } })
                : [];
        return Promise.all(users.map(u => this.adapter.transform(u, i18n)));
    }

    @UseGuards(JwtAuthGuard)
    @Get("")
    @ApiOperation({
        description: "Получение всех зарегистрированных пользователей.",
    })
    @ApiBearerAuth()
    async listUsers(@I18n() i18n: I18nContext): Promise<GetUserDto[]> {
        const users = await this.users.findMany();
        const hydrated = users.map(user => this.adapter.transform(user, i18n));
        return Promise.all(hydrated);
    }

    @UseGuards(JwtAuthGuard)
    @Get("@me")
    @ApiOperation({
        description: "Получение текущего пользователя.",
    })
    @ApiBearerAuth()
    async getMe(
        @Request() { user }: ExtendedRequest,
            @I18n() i18n: I18nContext
    ): Promise<GetUserDto> {
        const fullUser = await this.users.findOne(user.id);
        const hydrated = this.adapter.transform(fullUser, i18n);
        return hydrated;
    }

    @Get("top")
    @ApiOperation({
        description: "Получение лучших юристов в организации.",
    })
    async getTopLawyers(@I18n() i18n: I18nContext) {
        return Promise.all(
            (
                await this.users.findMany({
                    where: {
                        type: UserType.LAWYER,
                    },
                    order: {
                        rating: "DESC",
                    },
                    take: 4,
                })
            ).map(u => this.adapter.transform(u, i18n))
        );
    }

    @Get(":uid")
    @ApiOkResponse({
        description: "Предоставлена информация о пользователе.",
        type: GetUserInfoDto,
    })
    @ApiNotFoundResponse({ description: "Пользователь не найден." })
    @ApiOperation({
        description: "Получение информации о пользователе.",
    })
    async getUserInfo(
        @Param("uid") userId: string,
            @I18n() i18n: I18nContext
    ): Promise<GetUserInfoDto> {
        try {
            const user = await this.users.findOne(userId);
            return this.adapter.transform(user, i18n);
        } catch (e) {
            throw new NotFoundException("The user does not exist.");
        }
    }

    @Types(UserType.ADMIN, UserType.MODERATOR)
    @UseGuards(JwtAuthGuard, UserGuard)
    @Patch(":uid")
    @ApiOkResponse({
        description: "Данные пользователя были успешно изменены.",
        type: User,
    })
    @ApiNotFoundResponse({ description: "Пользователь не найден." })
    @ApiBadRequestResponse({
        description: "Формат принимаемых данных был неверным.",
    })
    @ApiForbiddenResponse({
        description: "У пользователя нет прав на совершение этого действия.",
    })
    @ApiBearerAuth()
    @ApiBody({
        description: "Изменяемая информация о пользователе.",
        type: PatchUserDto,
    })
    @ApiOperation({
        description: "Обновление пользовательских данных.",
    })
    async updateUserInfo(
        @Param("uid") userId: string,
            @Body() data: PatchUserDto,
            @I18n() i18n: I18nContext
    ): Promise<GetUserDto> {
        try {
            await this.users.updateOne(userId, data);
            const user = await this.users.findOne(userId);
            return this.adapter.transform(user, i18n);
        } catch (e) {
            throw new NotFoundException("The user does not exist.");
        }
    }

    @Types(UserType.MODERATOR, UserType.ADMIN)
    @UseGuards(JwtAuthGuard, UserGuard)
    @Delete(":uid")
    @ApiForbiddenResponse({
        description: "У пользователя нет прав на совершение этого действия.",
    })
    @ApiNoContentResponse({
        description: "Пользователь был успешно удален.",
    })
    @ApiNotFoundResponse({ description: "Пользователь не найден." })
    @ApiBearerAuth()
    @ApiOperation({
        description: "Удаление пользователя.",
    })
    deleteUser(@Param("uid") userId: string) {
        try {
            return this.users.deleteOne(userId);
        } catch (e) {
            throw new NotFoundException("The user does not exist.");
        }
    }

    @Types(UserType.MODERATOR, UserType.ADMIN)
    @UseGuards(JwtAuthGuard, UserGuard)
    @Post(":uid/verified")
    @ApiForbiddenResponse({
        description: "У пользователя нет прав на совершение этого действия.",
    })
    @ApiNoContentResponse({
        description: "Профиль пользователя был успешно подтвержден.",
    })
    @ApiNotFoundResponse({ description: "Пользователь не найден." })
    @ApiBearerAuth()
    @ApiOperation({
        description: "Установка флага подтверждения пользователя.",
    })
    @ApiBody({
        description: "Флаг подтверждения.",
        type: PatchUserVerifiedDto,
    })
    async setUserVerified(
    @Param("uid") userId: string,
        @Body() { verified }: PatchUserVerifiedDto
    ) {
        try {
            await this.users.updateOne(userId, { verified });
        } catch (e) {
            throw new NotFoundException("The user does not exist.");
        }
    }

    @ApiOperation({
        description: "Модификация рейтинга пользователя.",
    })
    @Post(":uid/rating")
    async modifyUserRating(
    @Param("uid") userId: string,
        @Query("offset") offset: string
    ) {
        if (+offset < -2 || +offset > 2)
            throw new BadRequestException("Offset should be between -2 and 2.");
        const user = await this.users.findOne(userId);
        await this.users.updateOne(userId, { rating: user.rating + +offset });
    }

    @Get(":uid/time_slots")
    async getTimeSlots(
    @Param("uid") userId: string,
        @Query("date") date: string
    ) {
        try {
            const user = await this.users.findOne(userId);
            const events = (await this.schedules.findManyByLawyer(userId)).filter(
                ({ start_timestamp }) =>
                    start_timestamp.toLocaleDateString() ===
          new Date(date).toLocaleDateString()
            );
            const slots = [...user.timeSlots].map($ => ({
                ...$,
                start: $.start.split(":", 2).join(":"),
                end: $.end.split(":", 2).join(":"),
            }));
            events.forEach(({ start_timestamp, end_timestamp }) => {
                const start = start_timestamp.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });
                const day = start_timestamp.getDay();
                const end = end_timestamp.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });

                const slotIndex = slots
                    .filter(s => s.day === day)
                    .findIndex(s => s.start <= start && s.end >= end);
                if (slotIndex === -1) return;
                const spawnSlot: TimeSlot = { ...slots[slotIndex] };

                slots[slotIndex].end = start;
                spawnSlot.start = end;

                if (slots[slotIndex].start === slots[slotIndex].end) {
                    slots.splice(slotIndex, 1);
                }

                if (spawnSlot.start !== spawnSlot.end) {
                    slots.push(spawnSlot);
                }
            });

            return slots;
        } catch (e) {
            console.error(e);
            throw new NotFoundException("User was not found.");
        }
    }

    @Types(UserType.LAWYER, UserType.MODERATOR, UserType.ADMIN)
    @UseGuards(JwtAuthGuard, UserGuard)
    @ApiOperation({
        description: "Модификация времени работы юриста.",
    })
    @Patch("@me/time_slots")
    async changeTimeSlots(
    @Body() body: { day: number; start: string; end: string }[],
        @Request() { user }: ExtendedRequest
    ) {
        try {
            const exUser = await this.users.findOne(user.id);
            await this.slots.remove(exUser.timeSlots);
            const uqSlots = [];
            body.forEach(s => {
                if (uqSlots.findIndex(u => u.day === s.day) === -1) {
                    uqSlots.push(s);
                }
            });
            const slots = uqSlots.map(({ day, start, end }, i) => ({
                start,
                end,
                day,
                user: { id: user.id },
            }));
            await Promise.all(slots.map(slot => this.slots.save(slot)));
        } catch (e) {
            console.error(e);
            throw new NotFoundException("The user does not exist.");
        }
    }
}
