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
import { User } from './user.entity';

@Entity()
export class PendingEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  description: string;

  @Column('timestamp without time zone')
  start_timestamp: Date;

  @Column('timestamp without time zone')
  end_timestamp: Date;

  @OneToOne(() => User, {
    cascade: ["insert", "update", "remove"],
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'from_id' })
  from: User;

  @OneToOne(() => User, {
    cascade: ["insert", "update", "remove"],
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'lawyer_id' })
  lawyer: User;

  @ManyToMany(() => User, {
    cascade: ["insert", "update", "remove"],
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
  participants: User[];
}
