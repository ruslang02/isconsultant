import { User, UserType } from '@common/models/user.entity';
import { BadRequestException, Inject, Injectable, LoggerService, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@common/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import e from 'express';

const {
  DEVELOPMENT
} = process.env;

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  constructor(
    @Inject('Logger')
    private logger: LoggerService,
    private users: UsersService,
    private jwt: JwtService
  ) { }
  onApplicationBootstrap() {
    if (DEVELOPMENT == "true") {
      let user = new User()
      user.email = "user@user.com"
      user.first_name = "Ruslan"
      user.last_name = "Garifullin"
      user.middle_name = "Ilfatovich"
      user.avatar = "https://sun1-20.userapi.com/s/v1/if1/QYezcXh38laVuk3S6bCq9gd96HWGT_s-nyKzawPEucGu2uxmZcuR0kwEygqemsKPnwHQMDbj.jpg?size=400x0&quality=96&crop=686,0,1264,1704&ava=1"
      user.password = "user"

      this.users.insertOne({ ...user, type: UserType.CLIENT, verified: true }).then((insertRes: any) => {
        this.logger.log(`AuthService:`, 'Client test account created.');
      }).catch(() => { });

      user.email = "user1@user.com"
      user.first_name = "Vlad"
      user.last_name = "Dineev"
      user.avatar = "https://i.imgur.com/KRRtxQB.png"
      user.password = "user1"

      this.users.insertOne({ ...user, type: UserType.CLIENT, verified: true }).then((insertRes: any) => {
        this.logger.log(`AuthService:`, 'Client 1 test account created.');
      }).catch(() => { });

      user.email = "user2@user.com"
      user.first_name = "Egor"
      user.last_name = "Dadugin"
      user.avatar = "https://sun1-19.userapi.com/s/v1/ig2/D3Tfz_RM8tmptskKYv3AgDpEZL6-2SDQMcSHZMOkmggPT-fYe2z7KUh_o-9HCLwYTIsGBqHtBWl2kzG91VBhXenf.jpg?size=400x0&quality=96&crop=51,608,1117,1117&ava=1"
      user.password = "user2"

      this.users.insertOne({ ...user, type: UserType.CLIENT, verified: true }).then((insertRes: any) => {
        this.logger.log(`AuthService:`, 'Client 2 test account created.');
      }).catch(() => { });

      user.email = "lawyer@lawyer.com"
      user.first_name = "Evgeniy"
      user.last_name = "Belyaev"
      user.middle_name = "Evgenievich"
      user.avatar = "https://balance2.pravoved.ru/userfiles/u1629277/preview_avatar.jpg"
      user.password = "lawyer"
      user.educationText = "<b>Алтайский государственный университет</b>, факультет - юридический (Барнаул, Россия, 1997)<br /><br />Проходил дополнительные курсы повышения квалификации."
      user.experienceText = "Руководитель - юридический кабинет Беляев Е.Е.. 25 лет стажа"
      user.specialtyText = "Специализируюсь в 14 категориях: Гражданское право, Семейное право, Арбитраж, Налоговое право, Договорное право, Право собственности, Права детей, Взыскание задолженности, Кредитование, Заключение и расторжение брака, Алименты, Раздел имущества, Усыновление, опека и попечительство, Международное право"

      this.users.insertOne({ ...user, type: UserType.LAWYER, verified: true }).then((insertRes: any) => {
        this.logger.log(`AuthService:`, 'Lawyer test account created.');
      }).catch(() => { });

      user.email = "lawyer2@lawyer.com"
      user.first_name = "Darya"
      user.last_name = "Gapina"
      user.middle_name = "Ivanovna"
      user.avatar = "https://balance2.pravoved.ru/userfiles/u1790299/preview_avatar.jpg"
      user.password = "lawyer2"
      user.educationText = "НИУ-ВШЭ, факультет - юридический (Санкт-Петербург, Россия, 2015)"
      user.experienceText = "6 лет стажа"
      user.specialtyText = "Специализируюсь в 14 категориях: Гражданское право, Арбитраж, Предпринимательское право, Тендеры, контрактная система в сфере закупок, Налоговое право, Интеллектуальная собственность, Договорное право, Право собственности, Взыскание задолженности, Кредитование, Авторские и смежные права, Товарные знаки, патенты, Интернет и право, Программы ЭВМ и базы данных"

      this.users.insertOne({ ...user, type: UserType.LAWYER, verified: true }).then((insertRes: any) => {
        this.logger.log(`AuthService:`, 'Lawyer 2 test account created.');
      }).catch(() => { });

      user.email = "moderator@moderator.com"
      user.first_name = "Andrey"
      user.last_name = "Vlasov"
      user.password = "moderator"

      this.users.insertOne({ ...user, type: UserType.MODERATOR, verified: true }).then((insertRes: any) => {
        this.logger.log(`AuthService:`, 'Moderator test account created.');
      }).catch(() => { });

      user.email = "admin@admin.com"
      user.first_name = "Saleh"
      user.last_name = "Hadi"
      user.password = "admin"

      this.users.insertOne({ ...user, type: UserType.ADMIN, verified: true }).then((insertRes: any) => {
        this.logger.log(`AuthService:`, 'Admin test account created.');
      }).catch(() => { });
    }
  }

  async validateUser(
    email: string,
    pass: string
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.users.findOneByEmail(email, { withPassword: true });
    if (user && user.password === pass) {
      const { password, ...safeUser } = user;
      if (!user.verified) {
        throw new BadRequestException('Your account was not verified yet.');
      }
      return safeUser;
    }

    throw new UnauthorizedException('Email or password were incorrect.');
  }

  async login(user: Pick<User, 'id' | 'type'>) {
    const payload = { id: user.id, type: user.type };
    return this.jwt.sign(payload);
  }

  async generateVerifyToken(user: Pick<User, 'id' | 'email'>) {
    const payload = { id: user.id, email: user.email };
    return this.jwt.sign(payload);
  }
}
