import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

export enum ReportStatus {
  AWAITING = 'awaiting',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
}

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  description: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  @ApiProperty({
    description: 'Автор жалобы.',
  })
  author: User;

  @OneToOne(() => User)
  @JoinColumn({ name: 'reciever_id' })
  @ApiProperty({
    description: 'Получатель жалобы.',
  })
  reciever: User;

  @Column({
    type: 'enum',
    enum: ReportStatus,
  })
  status: ReportStatus;

  @Column({
    type: 'text',
    nullable: true
  })
  decision?: string;
}
