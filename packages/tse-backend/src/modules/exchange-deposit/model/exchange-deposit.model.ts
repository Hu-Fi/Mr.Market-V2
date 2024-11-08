import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

export class CreateDepositDto {
  @AutoMap()
  @IsString()
  exchangeName: string;

  @AutoMap()
  @IsString()
  symbol: string;

  @AutoMap()
  @IsString()
  network: string;
}

export class CreateDepositCommand {
  @AutoMap()
  exchangeName: string;

  @AutoMap()
  symbol: string;

  @AutoMap()
  network: string;
}
