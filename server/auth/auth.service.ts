import { User } from '@common/models/User';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.users.findOneByEmail(email);
    if (user) {
      if (!user.verified) {
        throw new BadRequestException('Your account was not verified yet.');
      }
      if (user.password === pass) {
        const { id, type } = user;
        return { id, type };
      }
    }
    return null;
  }

  async login(user: Pick<User, 'id' | 'type'>) {
    const payload = { id: user.id, type: user.type };
    return {
      access_token: this.jwt.sign(payload),
    };
  }
}
