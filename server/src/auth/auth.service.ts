import { User, UserType } from "@common/models/user.entity";
import { BadRequestException, Inject, Injectable, LoggerService, OnApplicationBootstrap, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "@common/dto/create-user.dto";
import e from "express";
import { UsersService } from "../users/users.service";

const {
    DEVELOPMENT
} = process.env;

const mockUsers: Partial<User>[] = [{
    email: "user@user.com",
    first_name: "Ruslan",
    last_name: "Garifullin",
    middle_name: "Ilfatovich",
    avatar: "https://sun1-20.userapi.com/s/v1/if1/QYezcXh38laVuk3S6bCq9gd96HWGT_s-nyKzawPEucGu2uxmZcuR0kwEygqemsKPnwHQMDbj.jpg?size=400x0&quality=96&crop=686,0,1264,1704&ava=1",
    password: "user",
    type: UserType.CLIENT,
    verified: true
}, {
    email: "user1@user.com",
    first_name: "Vlad",
    middle_name: "",
    last_name: "Dineev",
    avatar: "https://i.imgur.com/KRRtxQB.png",
    password: "user1",
    type: UserType.CLIENT,
    verified: true
}, {
    email: "user2@user.com",
    first_name: "Egor",
    last_name: "Dadugin",
    middle_name: "",
    avatar: "https://sun1-20.userapi.com/s/v1/if1/QYezcXh38laVuk3S6bCq9gd96HWGT_s-nyKzawPEucGu2uxmZcuR0kwEygqemsKPnwHQMDbj.jpg?size=400x0&quality=96&crop=686,0,1264,1704&ava=1",
    password: "user2",
    type: UserType.CLIENT,
    verified: true
}, {
    email: "lawyer@lawyer.com",
    first_name: "Evgeniy",
    last_name: "Belyaev",
    middle_name: "Evgenievich",
    avatar: "https://balance2.pravoved.ru/userfiles/u1629277/preview_avatar.jpg",
    password: "lawyer",
    educationText: "<b>Алтайский государственный университет</b>, факультет - юридический (Барнаул, Россия, 1997)<br /><br />Проходил дополнительные курсы повышения квалификации.",
    experienceText: "Руководитель - юридический кабинет Беляев Е.Е.. 25 лет стажа",
    specialtyText: "Специализируюсь в 14 категориях: Гражданское право, Семейное право, Арбитраж, Налоговое право, Договорное право, Право собственности, Права детей, Взыскание задолженности, Кредитование, Заключение и расторжение брака, Алименты, Раздел имущества, Усыновление, опека и попечительство, Международное право",
    type: UserType.LAWYER,
    verified: true
}, {
    email: "lawyer2@lawyer.com",
    first_name: "Darya",
    last_name: "Gapina",
    middle_name: "Ivanovna",
    avatar: "https://balance2.pravoved.ru/userfiles/u1790299/preview_avatar.jpg",
    password: "lawyer2",
    educationText: "НИУ-ВШЭ, факультет - юридический (Санкт-Петербург, Россия, 2015)",
    experienceText: "6 лет стажа",
    specialtyText: "Специализируюсь в 14 категориях: Гражданское право, Арбитраж, Предпринимательское право, Тендеры, контрактная система в сфере закупок, Налоговое право, Интеллектуальная собственность, Договорное право, Право собственности, Взыскание задолженности, Кредитование, Авторские и смежные права, Товарные знаки, патенты, Интернет и право, Программы ЭВМ и базы данных",
    type: UserType.LAWYER,
    verified: true
}, {
    email: "moderator@moderator.com",
    first_name: "Andrey",
    last_name: "Tamanov",
    middle_name: "",
    password: "moderator",
    type: UserType.MODERATOR,
    verified: true
}, {
    email: "admin@admin.com",
    first_name: "Hadi",
    last_name: "Saleh",
    middle_name: "",
    password: "admin",
    type: UserType.ADMIN,
    verified: true
}];

@Injectable()
export class AuthService implements OnApplicationBootstrap {
    constructor(
        @Inject("Logger")
        private logger: LoggerService,
        private users: UsersService,
        private jwt: JwtService
    ) { }
    onApplicationBootstrap() {
        if (DEVELOPMENT !== "true") return;

        mockUsers.forEach(u => this.users.insertOne(u).catch(() => {}));
    }

    async validateUser(
        email: string,
        pass: string
    ): Promise<Omit<User, "password"> | null> {
        const user = await this.users.findOneByEmail(email, { withPassword: true });
        if (user && user.password === pass) {
            const { password, ...safeUser } = user;
            if (!user.verified) {
                throw new BadRequestException("Your account was not verified yet.");
            }
            return safeUser;
        }

        throw new UnauthorizedException("Email or password were incorrect.");
    }

    async login(user: Pick<User, "id" | "type">) {
        const payload = { id: user.id, type: user.type };
        return this.jwt.sign(payload);
    }

    async generateVerifyToken(user: Pick<User, "id" | "email">) {
        const payload = { id: user.id, email: user.email };
        return this.jwt.sign(payload);
    }
}
