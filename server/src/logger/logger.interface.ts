import { LoggerService as NestLoggerService } from "@nestjs/common";

export interface LoggerService extends NestLoggerService {
    get(): string[]
}