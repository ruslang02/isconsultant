import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { Comment } from './Comment';

export enum UserType {
  ADMIN = "admin",
  MODERATOR = "moderator",
  LAWYER = "lawyer",
  CLIENT = "client"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя.'
  })
  id: number;

  @Column()
  @ApiProperty({
    description: 'Адрес электронной почты пользователя.'
  })
  email: string;

  @Column()
  @ApiProperty({
    description: 'Захешированный пароль пользователя.'
  })
  password: string;

  @Column()
  @ApiProperty({
    description: 'Имя пользователя.'
  })
  first_name: string;

  @Column()
  @ApiProperty({
    description: 'Отчество пользователя.'
  })
  middle_name: string;

  @Column()
  @ApiProperty({
    description: 'Фамилия пользователя.'
  })
  last_name: string;
  
  @Column({
    type: 'enum',
    enum: UserType
  })
  @ApiProperty({
    description: 'Тип пользователя.'
  })
  type: UserType;

  @Column()
  @ApiProperty({
    description: 'Отчество пользователя.'
  })
  phone: string;

  @Column()
  @ApiProperty({
    description: 'Хэш-код изображения на аватаре пользователя.'
  })
  avatar: string;

  @Column({ default: false })
  @ApiProperty({
    description: 'Флаг о подтверждении аккаунта.'
  })
  verified: boolean;

  @Column({ default: 0 })
  @ApiProperty({
    description: 'Рейтинг пользователя.'
  })
  rating: number;
}