# How to Add Exchange API Keys

This system allows to securely manage API keys for different exchanges, which are used for integration with the application.    
Below is an explanation of how it works and the available options:

## How to Use:

1. **Adding an API Key**:
    - Add an API key for an exchange by sending a `POST` request to the `/exchange-api-key` endpoint with the appropriate data (API key, API secret, optional passphrase, and description).

2. **Retrieving API Keys**:
    - To retrieve stored API keys for a specific exchange, use the `GET /exchange-api-key?exchangeName=<exchangeName>` endpoint.

3. **Removing API Keys**:
    - API keys can be removed via the `DELETE /exchange-api-key?id=<id>` endpoint. Removal only sets the `removed` flag to `true`, meaning the data remains in the database but is no longer used.

## Features:

- **Multiple Exchange Support**: You can add more than one API keys for particular exchange, and the system will automatically select the correct exchange account based on the selected strategy.
- **Data Protection**: All sensitive data, such as API secrets, is encrypted before being stored in the database.
- **Flexible Management**: You can add, retrieve, and remove API keys at any time, giving you full control over the exchange connections.
- **Customizable Selection Strategies**: Implement and use custom strategies to dynamically select the appropriate exchange account based on attributes or market conditions.
### Exchange Registry Module file structure
````
exchange-registry/
├── exchange-manager/
│   ├── model/
│   ├── strategies/
│   │   ├── first-exchange.strategy.ts
│   ├── exchange-api-key.controller.ts
│   ├── exchange-api-key.mapper.ts
│   ├── exchange-api-key.repository.ts
│   ├── exchange-api-key.service.ts
│   ├── exchange-manager.service.ts
│   ├── exchange-selection-strategy.interface.ts
├── exchange-registry.module.ts
├── exchange-registry.service.spec.ts
├── exchange-registry.service.ts
````