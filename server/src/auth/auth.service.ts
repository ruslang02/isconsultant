import { User, UserType } from '@common/models/user.entity';
import { BadRequestException, Injectable, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@common/dto/create-user.dto';
import { UsersService } from '../users/users.service';

const {
  DEVELOPMENT
} = process.env;

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  constructor(private users: UsersService, private jwt: JwtService) { }
  onApplicationBootstrap() {
    if (DEVELOPMENT == "true") {
      let user = new CreateUserDto()
      user.email = "test@test.com"
      user.first_name = "test"
      user.last_name = "test"
      user.middle_name = "test"
      user.password = "test"

      console.log("Creating test user...")
      this.users.findOneByEmail("test@test.com").then((u: User) => {
        if(!u) {
          this.users.insertOne({...user, type: UserType.ADMIN, verified: true}).then((insertRes: any) => {
            console.log(insertRes)
          })
        }
      }).catch((reason: any) => {
        console.log(reason)
        this.users.insertOne({...user, type: UserType.ADMIN, verified: true}).then((insertRes: any) => {
          console.log(insertRes)
        })
      })
    }
  }

  async validateUser(
    email: string,
    pass: string
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.users.findOneByEmail(email, { withPassword: true });
    console.log(user);
    if (user) {
      if (user.password === pass) {
        const { password, ...safeUser } = user;
        if (!user.verified) {
          throw new BadRequestException('Your account was not verified yet.');
        }
        return safeUser;
      }
    }

    throw new UnauthorizedException('Email or password were incorrect.');
  }

  async login(user: Pick<User, 'id' | 'type'>) {
    const payload = { id: user.id, type: user.type };
    return this.jwt.sign(payload);
  }

  async generateVerifyToken(id: number, password: string, verified: boolean) {
    const payload = { id: id };
    return this.jwt.sign(payload, { secret: password + verified });
  }
}
