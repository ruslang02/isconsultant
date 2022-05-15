import { ChatMessage } from "@common/models/chat-message.entity";
import { User } from "@common/models/user.entity";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RedisService } from "redis/redis.service";
import { SchedulesService } from "schedules/schedules.service";
import { SnowflakeService } from "schedules/snowflake.service";
import { DeepPartial, Repository } from "typeorm";

interface RedisChatMessage {
    author_id: string
    event_id: string
    created_at: number
    content: string
}

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(User)
        private users: Repository<User>,
        @Inject(forwardRef(() => SchedulesService))
        private schedules: SchedulesService,
        private redis: RedisService,
        private snowflake: SnowflakeService
    ) { }

    async createChatMessage(uid: string, eid: string, content: string) {
        const { id: event_id } = await this.schedules.findEvent(eid);
        await this.redis.client.set(`chat_message-${event_id}-${this.snowflake.make()}`, JSON.stringify({
            author_id: uid,
            event_id,
            created_at: Date.now(),
            content
        }));
    }

    async getForEvent(eid: string, loadUsers?: boolean) {
        const scanner = this.redis.client.scanIterator({
            TYPE: "string",
            MATCH: `chat_message-${eid}-*`
        });
        const messages: DeepPartial<ChatMessage>[] = [];
        for await (const key of scanner) {
            const [, event_id, message_id] = key.split("-");
            const message: RedisChatMessage = JSON.parse(await this.redis.client.get(key));
            const from = loadUsers
                ? await this.users.findOneOrFail({ where: { id: +message.author_id } })
                    .catch(() => ({ id: +message.author_id }))
                : { id: +message.author_id };
            messages.push({
                id: message_id,
                content: message.content + "",
                event: { id: +event_id },
                from
            });
        }

        return messages.sort((a, b) => (a.created_timestamp as Date).getTime() - (b.created_timestamp as Date).getTime())
    }
}
