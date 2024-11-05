import { IsNumber, IsString } from 'class-validator';
import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @AutoMap()
  @ApiProperty()
  @IsNumber()
  amount: number;

  @AutoMap()
  @ApiProperty({ example: '43d61dcd-e413-450d-80b8-101d5e903357' })
  @IsString()
  assetId: string;

  @AutoMap()
  @ApiProperty({ example: '43d61dcd-e413-450d-80b8-101d5e903357' })
  @IsString()
  chainId: string;
}

export class DepositCommand {
  userId: string;
  @AutoMap()
  amount: number;
  @AutoMap()
  assetId: string;
  @AutoMap()
  chainId: string;
}
