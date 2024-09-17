import { ConfigService } from '@nestjs/config';

interface ExchangeConfig {
  name: string;
  api: string;
  secret: string;
}

export function buildExchangeConfigs(
  configService: ConfigService,
): Record<string, ExchangeConfig> {
  return Object.keys(process.env)
    .filter((key) => key.startsWith('EXCHANGE'))
    .reduce((configs, key) => {
      const keyParts = key.split('_');
      const exchangeName = keyParts[1];
      const field = keyParts[2];
      const lowerCaseExchangeName = exchangeName.toLowerCase();
      if (!configs[lowerCaseExchangeName]) {
        configs[lowerCaseExchangeName] = { name: lowerCaseExchangeName };
      }
      configs[lowerCaseExchangeName][field.toLowerCase()] =
        configService.get<string>(key);
      return configs;
    }, {});
}
