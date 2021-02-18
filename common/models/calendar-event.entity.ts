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
import { File } from './file.entity';
import { User } from './user.entity';

export enum RoomAccess {
  NO_PASSWORD = 0,
  PASSWORD = 1,
  ONLY_PARTICIPANTS = 2
}

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @ApiProperty({
    description: 'Время создания события.',
  })
  created_timestamp: Date;

  @Column('varchar', { length: 100 })
  @ApiProperty({
    description: 'Название события.',
  })
  title: string;

  @Column('text')
  @ApiProperty({
    description: 'Описание события.',
  })
  description: string;

  @Column('timestamp without time zone')
  @ApiProperty({
    description: 'Время начала события.',
  })
  start_timestamp: Date;

  @Column('timestamp without time zone')
  @ApiProperty({
    description: 'Время окончания события.',
  })
  end_timestamp: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  @ApiProperty({
    description: 'Пользователь, управляющий этим событием.',
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
    description: 'Пользователи, участвующие в этом событии.',
  })
  participants: User[];

  @ManyToMany(() => File, {
    cascade: true,
  })
  @JoinTable({
    joinColumn: {
      name: 'event_id',
    },
    inverseJoinColumn: {
      name: 'file_id',
    },
  })
  @ApiProperty({
    description: 'Файлы, принадлежащие этому событию.',
  })
  files: File[];

  @ApiProperty({
    description: "Идентификатор комнаты в Janus."
  })
  roomId: number;

  @ApiProperty({
    description: "Пароль для доступа к комнате в Janus (заполняется только если roomAccess = PASSWORD)."
  })
  roomPassword?: string;

  @ApiProperty({
    default: RoomAccess.NO_PASSWORD,
    description: "Уровень доступа к комнате Janus.",
    enum: RoomAccess,
  })
  roomAccess: RoomAccess;
}
