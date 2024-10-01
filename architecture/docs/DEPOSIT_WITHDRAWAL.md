# Deposit Process:
1. Call the `/transaction/deposit` endpoint to generate a deposit address.

2. The user transfers the required assets to the generated deposit address.

3. Once transaction confirmed, update the user's balance in the database.

# Withdrawal Process:
1. Call the `/transaction/withdraw` endpoint to initiate a withdrawal to the specified destination address.

2. Upon successful withdrawal, reduce the user's balance in the database.
