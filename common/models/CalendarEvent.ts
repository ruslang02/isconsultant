import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {length: 100})
  title: string;

  @Column('text')
  description: string;

  @Column('time')
  startTime: Date;

  @Column('time')
  endTime: Date;

  @OneToOne(() => User)
  @JoinColumn()
  owner: User;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];
}