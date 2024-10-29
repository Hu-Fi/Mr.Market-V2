# Deposit and Withdrawal Processes

## Deposit (Mixin)
1. Call the `/transaction/deposit` endpoint to generate a deposit address.
2. The user transfers the required assets to the generated deposit address.
3. Once confirmed, update the user's balance in the database.

## Deposit (TSE)
1. Call the `/transaction/exchange-deposit` endpoint to create a deposit address.
2. The system interacts with the respective exchange via the `ExchangeDepositService`.
3. Update the user's balance once the address is confirmed.

---

## Withdrawal (Mixin)
1. Call the `/transaction/withdraw` endpoint to initiate a withdrawal to the specified destination address.
2. Upon successful withdrawal, reduce the user's balance in the database.

## Withdrawal (TSE)
1. Call the `/transaction/exchange-withdrawal` endpoint to process the withdrawal request.
2. The system interacts with the respective exchange via the `ExchangeWithdrawalService`.
3. Reduce the user's balance after a successful withdrawal.
