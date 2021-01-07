import { User } from '@common/models/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateUser(
    email: string,
    pass: string
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.users.findOneByEmail(email, { withPassword: true });
    console.log(user);
    if (user) {
      if (!user.verified) {
        throw new BadRequestException('Your account was not verified yet.');
      }
      if (user.password === pass) {
        const { password, ...safeUser } = user;
        return safeUser;
      }
    }
    return null;
  }

  async login(user: Pick<User, 'id' | 'type'>) {
    const payload = { id: user.id, type: user.type };
    return this.jwt.sign(payload);
  }
}
