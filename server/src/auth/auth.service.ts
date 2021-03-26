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
      let user = new CreateUserDto()
      user.email = "user@user.com"
      user.first_name = "user"
      user.last_name = "user"
      user.middle_name = "user"
      user.password = "user"

      this.users.insertOne({ ...user, type: UserType.CLIENT, verified: true }).then((insertRes: any) => {
        this.logger.log(`AuthService:`, 'Client test account created.');
      }).catch(() => { });

      user.email = "lawyer@lawyer.com"
      user.first_name = "lawyer"
      user.last_name = "lawyer"
      user.middle_name = "lawyer"
      user.password = "lawyer"

      this.users.insertOne({ ...user, type: UserType.LAWYER, verified: true }).then((insertRes: any) => {
        this.logger.log(`AuthService:`, 'Lawyer test account created.');
      }).catch(() => { });

      user.email = "moderator@moderator.com"
      user.first_name = "moderator"
      user.last_name = "moderator"
      user.middle_name = "moderator"
      user.password = "moderator"

      this.users.insertOne({ ...user, type: UserType.MODERATOR, verified: true }).then((insertRes: any) => {
        this.logger.log(`AuthService:`, 'Moderator test account created.');
      }).catch(() => { });

      user.email = "admin@admin.com"
      user.first_name = "admin"
      user.last_name = "admin"
      user.middle_name = "admin"
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
