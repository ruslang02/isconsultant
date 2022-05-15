import { Injectable } from "@nestjs/common";
import { createClient } from "redis";

@Injectable()
export class RedisService {
    client = createClient({ url: process.env.REDIS_URL });
}
