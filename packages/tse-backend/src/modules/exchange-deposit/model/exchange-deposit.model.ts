import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

export class CreateDepositDto {
  @AutoMap()
  @IsString()
  userId: string;

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
  userId: string;

  @AutoMap()
  exchangeName: string;

  @AutoMap()
  symbol: string;

  @AutoMap()
  network: string;
}
