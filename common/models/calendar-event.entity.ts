import { ApiProperty } from '@nestjs/swagger';
import {
  Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn
} from 'typeorm';
import { ChatMessage } from './chat-message.entity';
import { File } from './file.entity';
import { User } from './user.entity';

export enum RoomAccess {
  PASSWORD = 0,
  ONLY_PARTICIPANTS = 1
}

export enum Status {
  NEW = 0,
  STARTED = 1,
  FINISHED = 2
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

  @ManyToOne(() => User, user => user.ownedEvents, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'owner_id' })
  @ApiProperty({
    description: 'Пользователь, управляющий этим событием.',
  })
  owner: User;

  @ManyToMany(() => User, user => user.events, {
    onDelete: 'CASCADE'
  })
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
    onDelete: 'CASCADE'
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

  @Column({ type: 'int', name: "room_id" })
  @ApiProperty({
    description: "Идентификатор комнаты в Janus."
  })
  roomId: number;

  @Column({ type: 'text', name: "room_password" })
  @ApiProperty({
    description: "Пароль для доступа к комнате в Janus (заполняется только если roomAccess = PASSWORD)."
  })
  roomPassword?: string;

  @Column({ type: 'text', name: "room_secret" })
  @ApiProperty({
    description: "Секретный код для доступа к комнате."
  })
  roomSecret?: string

  @Column({ type: 'enum', enum: RoomAccess, name: "room_access" })
  @ApiProperty({
    default: RoomAccess.ONLY_PARTICIPANTS,
    description: "Уровень доступа к комнате Janus.",
    enum: RoomAccess,
  })
  roomAccess: RoomAccess;

  @OneToMany(() => ChatMessage, message => message.event, { onDelete: 'CASCADE' })
  messages: ChatMessage[]

  @Column({ type: 'enum', enum: Status, name: "room_status" })
  @ApiProperty({
    default: Status.NEW,
    description: "Статус события, отражающий состояние комнаты.",
    enum: Status
  })
  roomStatus: Status
}