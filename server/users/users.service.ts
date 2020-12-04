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

  findOne(userId: string): Promise<User> {
    return this.users.findOne(userId);
  }
}
