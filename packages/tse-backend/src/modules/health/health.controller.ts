import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get server health status' })
  async getHealth() {
    return this.healthService.geHealthStatuses();
  }
}
