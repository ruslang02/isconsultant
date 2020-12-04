import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  middleName: string;

  @Column()
  lastName: string;

  @Column({ default: false })
  verified: boolean;
}