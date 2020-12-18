import { User } from '@common/models/User';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private users: Repository<User>
  ) {}

  findOne(uid: string): Promise<User> {
    return this.users.findOne(uid);
  }

  findOneByEmail(email: string): Promise<User> {
    return this.users.findOne({
      where: {
        email
      }
    });
  }

  updateOne(uid: string, user: Partial<User>) {
    return this.users.update(uid, user);
  }

  deleteOne(uid: string) {
    return this.users.delete(uid);
  }
}
