import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './User';

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  title: string;

  @Column('text')
  description: string;

  @Column('timestamp without time zone')
  start_timestamp: Date;

  @Column('timestamp without time zone')
  end_timestamp: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
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
  participants: User[];
}
