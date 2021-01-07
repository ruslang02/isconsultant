import { Comment } from '@common/models/comment.entity.ts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private comments: Repository<Comment>
  ) {}

  listAll(uid: string) {
    return this.comments
      .createQueryBuilder('comment')
      .where('comment.recipient_id = :uid', { uid })
      .getMany();
  }
}
