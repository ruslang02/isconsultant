import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column()
  @ApiProperty({
    description: 'Адрес электронной почты пользователя.',
  })
  email: string;

  @Column()
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

  type_localized: string;

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
}
