import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class TimeSlot {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Уникальный идентификатор слота.',
    readOnly: true,
  })
  id: number;

  @Column({ type: "smallint" })
  day: number;

  @Column({ type: "time without time zone" })
  start: string

  @Column({ type: "time without time zone" })
  end: string

  @ManyToOne(() => User, user => user.timeSlots)
  user: User
}