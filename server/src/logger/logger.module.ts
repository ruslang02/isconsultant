import { Module } from "@nestjs/common";
import { MemoryLoggerService } from "./memory-logger.service";

const logger = {
    provide: "Logger",
    useExisting: MemoryLoggerService,
};

@Module({
    providers: [MemoryLoggerService, logger],
    exports: [MemoryLoggerService, logger],
})
export class LoggerModule { }
