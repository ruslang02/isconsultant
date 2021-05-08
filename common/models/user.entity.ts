import { LocalizedString } from '../utils/Locale';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { File } from './file.entity';
import { CalendarEvent } from './calendar-event.entity';
import { ChatMessage } from './chat-message.entity';
import { PendingEvent } from './pending-event.entity';
import { TimeSlot } from './time-slot.entity';

export enum UserType {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  LAWYER = 'lawyer',
  CLIENT = 'client',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя.',
    readOnly: true,
  })
  id: number;

  @Column({ unique: true })
  @ApiProperty({
    description: 'Адрес электронной почты пользователя.',
  })
  email: string;

  @Column({
    select: false,
  })
  @ApiProperty({
    description: 'Захешированный пароль пользователя.',
  })
  password: string;

  @Column()
  @ApiProperty({
    description: 'Имя пользователя.',
  })
  first_name: string;

  @Column()
  @ApiProperty({
    description: 'Отчество пользователя.',
  })
  middle_name: string;

  @Column()
  @ApiProperty({
    description: 'Фамилия пользователя.',
  })
  last_name: string;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  @ApiProperty({
    description: 'Тип пользователя.',
    enum: UserType,
  })
  type: UserType;

  type_localized: LocalizedString;

  @Column({
    nullable: true,
  })
  @ApiProperty({
    description: 'Номер телефона пользователя.',
    required: false,
  })
  phone?: string;

  @Column({
    nullable: true,
  })
  @ApiProperty({
    description: 'Хэш-код изображения на аватаре пользователя.',
    required: false,
  })
  avatar?: string;

  @Column({ default: false })
  @ApiProperty({
    description: 'Флаг о подтверждении аккаунта.',
  })
  verified: boolean;

  @Column({ default: 0, type: 'real' })
  @ApiProperty({
    description: 'Рейтинг пользователя.',
    readOnly: true,
  })
  rating: number;

  @CreateDateColumn()
  @ApiProperty({
    description: 'Время создания пользователя.',
    readOnly: true,
  })
  created_timestamp: Date;

  @OneToMany(() => File, f => f.owner)
  files: File[];

  @ManyToMany(() => CalendarEvent, event => event.participants)
  events: CalendarEvent[]

  @OneToMany(() => CalendarEvent, event => event.owner)
  ownedEvents: CalendarEvent[]

  @OneToMany(() => ChatMessage, message => message.from)
  messages: ChatMessage[]

  @OneToMany(() => PendingEvent, event => event.lawyer)
  requests: PendingEvent[]

  @Column({ default: "" })
  educationText: string

  @Column({ default: "" })
  experienceText: string

  @Column({ default: "" })
  specialtyText: string

  @OneToMany(() => TimeSlot, slot => slot.user)
  timeSlots: TimeSlot[]
}
