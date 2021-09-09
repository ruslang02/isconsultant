import { ApiProperty } from "@nestjs/swagger";
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne, PrimaryGeneratedColumn
} from "typeorm";
import { LocalizedString } from "../utils/Locale";
import { User } from "./user.entity";

export enum ReportStatus {
    AWAITING = "awaiting",
    PROCESSING = "processing",
    COMPLETE = "complete",
}

@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    @ApiProperty({
        description: "Время создания жалобы.",
    })
    created_timestamp: Date;

    @Column("text")
    description: string;

    @ManyToOne(() => User, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "author_id" })
    @ApiProperty({
        description: "Автор жалобы.",
    })
    author: User;

    @ManyToOne(() => User, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "receiver_id" })
    @ApiProperty({
        description: "Получатель жалобы.",
    })
    receiver: User;

    @Column({
        type: "enum",
        enum: ReportStatus,
    })
    status: ReportStatus;

    status_localized: LocalizedString;

    @Column({
        type: "text",
        nullable: true,
    })
    decision?: string;
}
