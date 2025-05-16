# How to Add Exchange API Keys

This module securely manages API keys for different exchanges to enable integration with the application. It supports both **regular** and **readonly** API keys, offering flexibility and security for administrative management.

---

## How to Use

### 1. **Add an API Key**

To add a regular API key:

**Endpoint:**

```
POST /exchange-api-key
```

**Body (Example):**

```json
{
  "description": "Binance Main Account",
  "exchangeName": "binance",
  "apiKey": "api_key",
  "apiSecret": "api_secret",
  "apiPassphrase": "optional_passphrase",
  "isDefaultAccount": true
}
```

The system assigns the key to the authenticated admin user’s context (`userId`), which is handled internally via JWT.

---

### 2. **Retrieve All API Keys**

To list all API keys for the current admin:

**Endpoint:**

```
GET /exchange-api-key
```

Returns all non-removed API keys for the authenticated admin user.

---

### 3. **Remove an API Key**

To logically remove an API key (it will no longer be used but will remain in the database):

**Endpoint:**

```
DELETE /exchange-api-key?id=<id>
```

This marks the key as `removed: true`.

---

### 4. **Add a Readonly API Key**

**Endpoint:**

```
POST /exchange-api-key/readonly
```

**Body (Example):**

```json
{
  "exchangeName": "binance",
  "apiKey": "readonly_key",
  "apiSecret": "readonly_secret",
  "apiPassphrase": "optional_passphrase"
}
```

---

## Security & Guards

All endpoints are secured by:

* `JwtAuthGuard` – ensures only authenticated users can access
* `RolesGuard` – only users with `ADMIN` role can use these endpoints
* `@ApiBearerAuth()` – requires `Authorization: Bearer <token>` header

---

## Features

* **Multiple Exchange Support**: Each user can store multiple keys per exchange.
* **Readonly Key Support**: Maintain separate readonly keys for use-cases where write access is not required.
* **Encryption**: All sensitive fields (`apiSecret`, `apiPassphrase`) are encrypted at rest.
* **Logical Deletion**: Keys are soft-deleted for auditing and rollback support.
* **Default Account Flag**: One account per exchange can be marked as the default for dynamic selection strategies.
* **Custom Selection Strategies**: Implement strategy patterns for key selection under `/strategies`.

---

## File Structure

```
exchange-registry/
├── exchange-manager/
│   ├── model/
│   │   ├── exchange-api-key.model.ts
│   │   └── exchange-api-key-readonly.model.ts
│   ├── strategies/
│   │   ├── get-additional-account.strategy.ts
│   │   ├── get-all-default-accounts.strategy.ts
│   │   └── get-default-account.strategy.ts
│   ├── exchange-api-key.controller.ts
│   ├── exchange-api-key.mapper.ts
│   ├── exchange-api-key.repository.ts
│   ├── exchange-api-key.service.ts
│   ├── exchange-api-key-readonly.service.ts
│   ├── exchange-api-key-readonly.repository.ts
│   ├── exchange-manager.service.ts
│   └── exchange-selection-strategy.interface.ts
├── exchange-registry.module.ts
├── exchange-registry.service.ts
└── exchange-registry.service.spec.ts
```

---