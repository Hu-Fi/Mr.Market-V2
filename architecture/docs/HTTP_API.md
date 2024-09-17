# Exchange API Service

This repository provides an API service built using NestJS for retrieving and managing exchange data and trade operations. The API includes two main controllers: `ExchangeDataController` and `ExchangeTradeController`.

## Controllers

### AuthController

- **Endpoints:**
  - `POST /admin/login`: Pass sha3-256 hashed password to log in with the access token
  - `POST /mixin/oauth`: Pass OAuth token to get access token ([go to mixin docs](https://developers.mixin.one/docs/api/oauth#post-oauthtoken))
```
 SCOPES: 'PROFILE:READ' | 'ASSETS:READ' | 'PHONE:READ' | 'CONTACTS:READ' | 'MESSAGES:REPRESENT' | 'SNAPSHOTS:READ' | 'CIRCLES:READ' | 'CIRCLES:WRITE';
```
'PROFILE:READ' is mandatory for requesting authorization.
### ExchangeDataController

Handles requests related to market data, such as tickers, OHLCV data, and supported symbols.

- **Endpoints:**
    - `GET /exchange-data/tickers`: Retrieves ticker information based on the provided exchange and symbols.
    - `GET /exchange-data/ohlcv`: Fetches OHLCV (Open, High, Low, Close, Volume) data for a given exchange and symbol.
    - `GET /exchange-data/tickers/pairs`: Returns the supported trading pairs on the exchange.
    - `GET /exchange-data/tickers/price`: Gets the current price for a specific ticker.
    - `GET /exchange-data/tickers/multiple`: Retrieves prices for multiple tickers across different exchanges.
    - `GET /exchange-data/tickers/symbols`: Lists the supported symbols for a given exchange.

### ExchangeTradeController

Handles requests related to trading operations, including market and limit orders, and order cancellation.

- **Endpoints:**
    - `POST /exchange-trade/market`: Executes a market trade based on the provided trade details.
    - `POST /exchange-trade/limit`: Executes a limit trade with the specified price and amount.
    - `POST /exchange-trade/cancel/:orderId/:symbol`: Cancels an existing order based on the order ID and symbol.
