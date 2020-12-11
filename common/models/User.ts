import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

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
    description: 'Имя пользователя.'
  })
  firstName: string;

  @Column()
  @ApiProperty({
    description: 'Отчество пользователя.'
  })
  middleName: string;

  @Column()
  @ApiProperty({
    description: 'Фамилия пользователя.'
  })
  lastName: string;
  
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
  phoneNumber: string;

  @Column()
  @ApiProperty({
    description: 'Ссылка на изображение на аватаре пользователя.'
  })
  avatarUrl: string;

  @Column({ default: false })
  @ApiProperty({
    description: 'Флаг о подтверждении аккаунта.'
  })
  verified: boolean;
}