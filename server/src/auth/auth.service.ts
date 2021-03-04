import { User } from '@common/models/user.entity';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) { }

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
