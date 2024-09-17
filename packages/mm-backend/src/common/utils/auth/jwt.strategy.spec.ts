import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ JWT_SECRET: 'secret' })],
        }),
      ],
      providers: [JwtStrategy, ConfigService],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate the payload and return user data', async () => {
    const payload = { sub: 'admin', roles: ['Admin'] };
    const result = await strategy.validate(payload);
    expect(result).toEqual({
      userId: 'admin',
      roles: ['Admin'],
    });
  });
});
