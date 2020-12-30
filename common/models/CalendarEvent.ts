import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @ApiProperty({
    description: 'Время создания события.'
  })
  created_timestamp: Date;

  @Column('varchar', { length: 100 })
  @ApiProperty({
    description: 'Название события.'
  })
  title: string;

  @Column('text')
  @ApiProperty({
    description: 'Описание события.'
  })
  description: string;

  @Column('timestamp without time zone')
  @ApiProperty({
    description: 'Время начала события.'
  })
  start_timestamp: Date;

  @Column('timestamp without time zone')
  @ApiProperty({
    description: 'Время окончания события.'
  })
  end_timestamp: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  @ApiProperty({
    description: 'Пользователь, управляющий этим событием.'
  })
  owner: User;

  @ManyToMany(() => User)
  @JoinTable({
    joinColumn: {
      name: 'event_id',
    },
    inverseJoinColumn: {
      name: 'participant_id',
    },
  })
  @ApiProperty({
    description: 'Пользователи, участвующие в этом событии.'
  })
  participants: User[];
}
