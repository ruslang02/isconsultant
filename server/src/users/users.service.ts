import { User } from '@common/models/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private users: Repository<User>
  ) {}

  async findMany(options?: FindManyOptions<any>): Promise<User[]> {
    return this.users.find(options);
  }

  findOne(uid: string): Promise<User> {
    return this.users.findOne(uid);
  }

  findOneByEmail(
    email: string,
    options?: { withPassword: boolean }
  ): Promise<User> {
    let query = this.users.createQueryBuilder('user');
    if (options?.withPassword) {
      query = query.addSelect('user.password');
    }
    query = query.where('email = :email', { email });

    return query.getOne();
  }

  insertOne(user: Partial<User>) {
    return this.users.insert(user);
  }

  updateOne(uid: string, user: Partial<User>) {
    return this.users.update(uid, user);
  }

  deleteOne(uid: string) {
    return this.users.delete(uid);
  }
}
