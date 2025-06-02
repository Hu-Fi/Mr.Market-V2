# Web3 Identity & Exchange Keys Management

## Security Warning

All sensitive data including Web3 private keys and exchange API secrets are currently stored **unencrypted** in the database.

## Overview

- **Web3 Private Key**: For campaign contributing
- **Exchange API Keys**: For cryptocurrency exchange access

## Features

### Web3 Identity
- Store a private key for a campaign process
- Configure RPC endpoints for multiple networks
- Auto-initialize signers for all configured chains
- Access wallet instances by chain ID

### Exchange Integration
- **Regular API Keys**: Full trading permissions with default account support
- **Read-only API Keys**: Market data access only
- Multiple exchange support via CCXT library
- Duplicate key prevention

## Current Status

Encryption has been temporarily disabled. All private keys and API secrets are stored as plain text. The codebase contains commented encryption/decryption calls indicating where security measures should be re-implemented.