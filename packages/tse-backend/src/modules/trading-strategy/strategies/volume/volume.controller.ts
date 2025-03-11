import { Body, Controller, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { VolumeStrategy } from './volume.strategy';
import {
  VolumeStrategyActionCommand,
  VolumeStrategyActionDto,
  VolumeStrategyCommand,
  VolumeStrategyDto,
} from './model/volume.model';

@ApiTags('trading-strategy')
@Controller('trading-strategy')
export class VolumeController {
  constructor(
    private readonly service: VolumeStrategy,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/create-volume')
  async createVolume(@Body() dto: VolumeStrategyDto) {
    const command = this.mapper.map(
      dto,
      VolumeStrategyDto,
      VolumeStrategyCommand,
    );
    return this.service.create(command);
  }

  @Put('/pause-volume')
  async pauseVolume(@Query() dto: VolumeStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      VolumeStrategyActionDto,
      VolumeStrategyActionCommand,
    );
    return this.service.pause(command);
  }

  @Put('/stop-volume')
  async stopVolume(@Query() dto: VolumeStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      VolumeStrategyActionDto,
      VolumeStrategyActionCommand,
    );
    return this.service.stop(command);
  }

  @Put('/delete-volume')
  async deleteVolume(@Query() dto: VolumeStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      VolumeStrategyActionDto,
      VolumeStrategyActionCommand,
    );
    return this.service.delete(command);
  }
}
