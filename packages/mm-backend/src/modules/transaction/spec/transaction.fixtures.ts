import { MixinDeposit } from '../../../common/entities/mixin-deposit.entity';
import { MixinDepositStatus } from '../../../common/enums/transaction.enum';

const DB_DATE = new Date('2024-09-25T13:47:25.000Z');
const MIXIN_DATE = '2024-09-25T13:47:25.332Z';
export const mockDeposits: MixinDeposit[] = [
  {
    id: 1,
    amount: 100,
    assetId: 'asset-123',
    userId: 'user-123',
    chainId: 'chain-123',
    destination: 'dest-123',
    status: MixinDepositStatus.PENDING,
    transactionHash: 'transaction-hash-1',
    createdAt: DB_DATE,
    updatedAt: DB_DATE,
  },
  {
    id: 2,
    amount: 200,
    assetId: 'asset-456',
    userId: 'user-456',
    chainId: 'chain-456',
    destination: 'dest-456',
    status: MixinDepositStatus.PENDING,
    transactionHash: 'transaction-hash-2',
    createdAt: DB_DATE,
    updatedAt: DB_DATE,
  },
  {
    id: 3,
    amount: 150,
    assetId: 'asset-123',
    userId: 'user-123',
    chainId: 'chain-123',
    destination: 'dest-123',
    status: MixinDepositStatus.PENDING,
    transactionHash: 'transaction-hash-3',
    createdAt: DB_DATE,
    updatedAt: DB_DATE,
  },
];

export const mockMixinPendingDeposits = [
  {
    amount: '100',
    created_at: MIXIN_DATE,
    confirmations: 3,
    threshold: 2,
    deposit_id: 'id-123',
    transaction_hash: 'hash-123',
  },
];
