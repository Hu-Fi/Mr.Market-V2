import { ConfigService } from '@nestjs/config';

interface Web3NetworkConfig {
  chainId: number;
  rpcUrl: string;
}

export function buildWeb3NetworkConfigs(
  configService: ConfigService,
): Web3NetworkConfig[] {
  return Object.keys(process.env)
    .filter(
      (key) => key.startsWith('WEB3_NETWORK_') && key.endsWith('_RPC_URL'),
    )
    .map((key) => {
      const networkName = key
        .replace('WEB3_NETWORK_', '')
        .replace('_RPC_URL', '');
      const rpcUrl = configService.get<string>(key);
      const chainIdKey = `WEB3_NETWORK_${networkName}_CHAIN_ID`;
      const chainId = parseInt(configService.get<string>(chainIdKey), 10);

      if (!rpcUrl || isNaN(chainId)) {
        throw new Error(`Invalid configuration for network: ${networkName}`);
      }

      return { chainId, rpcUrl };
    });
}
