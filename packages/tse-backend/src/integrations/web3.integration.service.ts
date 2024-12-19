import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Wallet } from 'ethers';
import { buildWeb3NetworkConfigs } from '../common/utils/config-utils';

@Injectable()
export class Web3IntegrationService {
  private signers: { [key: number]: Wallet } = {};
  WEB3_PRIVATE_KEY: string;

  constructor(private readonly configService: ConfigService) {
    this.WEB3_PRIVATE_KEY = this.configService.get<string>('WEB3_PRIVATE_KEY');

    const networks = buildWeb3NetworkConfigs(this.configService);

    for (const network of networks) {
      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      this.signers[network.chainId] = new Wallet(
        this.WEB3_PRIVATE_KEY,
        provider,
      );
    }
  }

  getSigner(chainId: number): Wallet {
    return this.signers[chainId];
  }
}
