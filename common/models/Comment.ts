import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Уникальный идентификатор комментария.'
  })
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  @ApiProperty({
    description: 'Автор комментария.'
  })
  author: User;

  @Column({
    type: 'text'
  })
  @ApiProperty({
    description: 'Содержание комментария.'
  })
  content: string;

  @CreateDateColumn()
  @ApiProperty({
    description: 'Дата создания комментария.'
  })
  created_timestamp: Date;

  @ManyToOne(() => User, user => user.comments, { })
  @JoinColumn({ name: 'recipient_id' })
  @ApiProperty({
    description: 'Пользователь, которому направлен комментарий.'
  })
  recipient: User
}