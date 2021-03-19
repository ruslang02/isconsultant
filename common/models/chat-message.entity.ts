import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CalendarEvent } from "./calendar-event.entity";
import { User } from "./user.entity";

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Уникальный идентификатор сообщения.',
  })
  id: number;

  @ManyToOne(() => User, user => user.messages)
  @JoinColumn({ name: 'from_id' })
  from: User;

  @ManyToOne(() => CalendarEvent, event => event.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: CalendarEvent;

  @Column('text')
  content: string;

  @CreateDateColumn()
  created_timestamp: Date;
}