import { UserType } from '@common/models/user.entity';
import { Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'guards/jwt.guard';
import { Types } from 'guards/type.decorator';
import { UserGuard } from 'guards/user.guard';
import { MemoryLoggerService } from 'logger/memory-logger.service';
import { Connection } from 'typeorm';

@ApiTags('Администрирование')
@Controller('/api/admin')
export class AdminController {
  constructor(
    @Inject("Logger")
    private logger: MemoryLoggerService,
    @InjectConnection()
    private connection: Connection
  ) { }

  @Types(UserType.ADMIN)
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiOperation({
    description: "Получает логи с работающего сервера."
  })
  @ApiBearerAuth()
  @Get("/log")
  getLog() {
    return { log: this.logger.getMemory() };
  }

  @Types(UserType.ADMIN)
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiOperation({
    description: "Перезагружает сервер."
  })
  @ApiBearerAuth()
  @Post("/restart")
  restart() {
    process.exit(0);
  }

  @Types(UserType.ADMIN)
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiOperation({
    description: "Удаляет все данные из базы данных."
  })
  @ApiBearerAuth()
  @Post("/purge")
  async purgeDb() {
    await this.connection.dropDatabase();
  }
}
