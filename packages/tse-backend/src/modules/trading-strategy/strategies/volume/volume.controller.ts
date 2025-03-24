import {
  Body,
  Controller,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { VolumeStrategy } from './volume.strategy';
import {
  VolumeStrategyActionCommand,
  VolumeStrategyActionDto,
  VolumeStrategyCommand,
  VolumeStrategyDto,
} from './model/volume.model';
import { JwtAuthGuard } from '../../../../common/utils/auth/guards/jwt-auth.guard';

@ApiTags('trading-strategy')
@Controller('trading-strategy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VolumeController {
  constructor(
    private readonly service: VolumeStrategy,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/create-volume')
  async createVolume(@Request() req, @Body() dto: VolumeStrategyDto) {
    const command = this.mapper.map(
      dto,
      VolumeStrategyDto,
      VolumeStrategyCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return this.service.create(command);
  }

  @Put('/pause-volume')
  async pauseVolume(@Request() req, @Query() dto: VolumeStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      VolumeStrategyActionDto,
      VolumeStrategyActionCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return this.service.pause(command);
  }

  @Put('/stop-volume')
  async stopVolume(@Request() req, @Query() dto: VolumeStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      VolumeStrategyActionDto,
      VolumeStrategyActionCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return this.service.stop(command);
  }

  @Put('/delete-volume')
  async deleteVolume(@Request() req, @Query() dto: VolumeStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      VolumeStrategyActionDto,
      VolumeStrategyActionCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return this.service.delete(command);
  }
}
