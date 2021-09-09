/* eslint-disable no-console */
import { Injectable } from "@nestjs/common";
import { LoggerService } from "./logger.interface";

@Injectable()
export class MemoryLoggerService implements LoggerService {
    private memory = "";

    get() {
        return this.memory.split("\n");
    }

    log(...message: string[]) {
        this.memory += message.map(_ => JSON.stringify(_)).join(" ") + "\n";
        console.log(...message);
    }
    error(message: string, trace: string) {
        this.memory += JSON.stringify(message) + "Trace: " + JSON.stringify(trace) + "\n";
        console.error(message, trace);
    }
    warn(...message: string[]) {
        this.memory += message.map(_ => JSON.stringify(_)).join(" ") + "\n";
        console.warn(...message);
    }
    debug(...message: string[]) {
        this.memory += message.map(_ => JSON.stringify(_)).join(" ") + "\n";
        console.debug(...message);
    }
    verbose(...message: string[]) {
        this.memory += message.map(_ => JSON.stringify(_)).join(" ") + "\n";
        console.debug(...message);
    }
}