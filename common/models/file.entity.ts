import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class File {
  @PrimaryColumn()
  @ApiProperty({
    description: 'Уникальный идентификатор хранимого файла.',
    readOnly: true,
  })
  id: string;

  @Column()
  @ApiProperty({
    description: 'Имя хранимого файла.',
  })
  name: string;

  @ManyToOne(() => User, u => u.files, {
    cascade: ["insert", "update", "remove"],
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  @ApiProperty({
    description: 'Пользователь, загрузивший файл.',
  })
  owner: User;
}