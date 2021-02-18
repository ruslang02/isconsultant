/* eslint-disable no-bitwise */
import { Injectable } from '@nestjs/common';
import { machineIdSync } from 'node-machine-id';

@Injectable()
export class SnowflakeService {
  private increment = 0;

  private readonly pid = process.pid & 0b11111;

  private readonly mid = machineIdSync().charCodeAt(0) & 0b11111;

  private readonly epoch = 1577826000000;

  make = () => {
    const { increment, pid, mid, epoch } = this;

    const timestamp = BigInt(new Date().getTime() - epoch);

    let result = BigInt(0);

    result += timestamp << 21n;
    result += BigInt(mid) << 17n;
    result += BigInt(pid) << 12n;
    result += BigInt(increment);
    this.increment += 1;

    return result.toString();
  };
}

export const snowflake = new SnowflakeService();