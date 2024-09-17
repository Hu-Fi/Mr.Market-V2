
## Using WebSocket Gateway

### Subscriptions

#### Subscribe to Order Book

- **Method Name:** `subscribeOrderBook`
- **Request Payload:**
    - `exchange`: The exchange to subscribe to (e.g., 'binance').
    - `symbol`: The trading pair symbol (e.g., 'BTC/USDT').

- **Listen to Event:** `OrderBookData`

#### Subscribe to OHLCV Data

- **Method Name:** `subscribeOHLCV`
- **Request Payload:**
    - `exchange`: The exchange to subscribe to (e.g., 'binance').
    - `symbol`: The trading pair symbol (e.g., 'BTC/USDT').
    - `timeFrame`: The time frame for the OHLCV data (e.g., '1m', '1h', '1d').
    - `since`: The timestamp to start the data from (optional).
    - `limit`: The number of data points to retrieve (optional).

- **Listen to Event:** `OHLCVData`

#### Subscribe to Ticker Data

- **Method Name:** `subscribeTicker`
- **Request Payload:**
    - `exchange`: The exchange to subscribe to (e.g., 'binance').
    - `symbol`: The trading pair symbol (e.g., 'BTC/USDT').

- **Listen to Event:** `TickerData`

#### Subscribe to Multiple Tickers Data

- **Method Name:** `subscribeTickers`
- **Request Payload:**
    - `exchange`: The exchange to subscribe to (e.g., 'binance').
    - `symbols`: An array of trading pair symbols (e.g., ['BTC/USDT', 'ETH/USDT']).

- **Listen to Event:** `TickersData`

#### Unsubscribe from Data

- **Method Name:** `unsubscribeData`
- **Request Payload:**
    - `type`: The type of market data (e.g., 'OrderBook', 'OHLCV', 'Ticker', 'Tickers').
    - `exchange`: The exchange to unsubscribe from (e.g., 'binance').
    - `symbol`: The trading pair symbol (optional).
    - `symbols`: An array of trading pair symbols (optional).

