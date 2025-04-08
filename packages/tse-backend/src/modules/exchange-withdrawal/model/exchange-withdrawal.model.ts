import { AutoMap } from '@automapper/classes';
import { IsNumber, IsString } from 'class-validator';

export class CreateWithdrawalDto {
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

  @AutoMap()
  @IsString()
  address: string;

  @AutoMap()
  @IsString()
  tag: string;

  @AutoMap()
  @IsNumber()
  amount: number;
}

export class CreateWithdrawalCommand {
  @AutoMap()
  @IsString()
  userId: string;
  @AutoMap()
  exchangeName: string;
  @AutoMap()
  symbol: string;
  @AutoMap()
  network: string;
  @AutoMap()
  address: string;
  @AutoMap()
  tag: string;
  @AutoMap()
  amount: number;
}
