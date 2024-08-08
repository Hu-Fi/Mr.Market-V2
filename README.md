**This is still in development and not ready for use. If you would like to test out Mr.Market, you can try the alpha V1 version available [here](https://github.com/Hu-Fi/Mr.Market/tree/main).**

# Introduction

## What is Mr.Market?

Mr.Market is a CeFi crypto bot and the reference exchange oracle for Hu-Fi. Mr.Market has three main functions:

- An automated crypto bot that supports a variety of strategies for arbitrage across CeFi exchanges.
- A front end where users can contribute funds to increase the ability to do Hu-Fi market making.

Learn more about [Hu-Fi](https://github.com/hu-fi).

### Mr.Market V1

You can find the V1 alpha version [here](https://github.com/Hu-Fi/Mr.Market/tree/main).

## What is Mr.Market V2?

Mr.Market V2 is the improved version of Mr.Market V1. While V1 was built with a time-to-market priority in mind, V2 features a new architecture designed to be more robust and scalable.

You can find the V2 high-level architecture overview [here](./MrMarket%20-%20V2%20architecture.md).

## Running the Application

### Running the Entire Application Using the Main `docker-compose.yml`

1. Navigate to the root directory of the project.
2. Copy the `.env.example` files to `.env` and adjust the environment variables.
3. Run Docker Compose.

    ```sh
    docker-compose up --build
    ```

### Running Individual Applications

#### Running `mm-backend`

1. Copy the `.env.example` file to `.env` and adjust the environment variables.

    ```sh
    cp packages/mm-backend/.env.example packages/mm-backend/.env
    ```

2. Navigate to the `mm-backend` directory.

    ```sh
    cd packages/mm-backend
    ```

3. Run Docker Compose.

    ```sh
    docker-compose up --build
    ```

#### Running `tse-backend`

1. Copy the `.env.example` file to `.env` and adjust the environment variables.

    ```sh
    cp packages/tse-backend/.env.example packages/tse-backend/.env
    ```

2. Navigate to the `tse-backend` directory.

    ```sh
    cd packages/tse-backend
    ```

3. Run Docker Compose.

    ```sh
    docker-compose up --build
    ```

## Deploying to Vercel

This project contains configuration files (`vercel.json`) for each app (`mm-backend` and `tse-backend`). Deployment to Vercel is possible and can be done through the Vercel dashboard.
1. Navigate to the Vercel dashboard.
2. Import your Git repository.
3. During the project setup, specify the root directory for the app (e.g., `packages/mm-backend` or `packages/tse-backend`).
4. Vercel will automatically use the `vercel.json` configuration file located in the specified directory.


## Migrations

```bash
# generate a migration file with the name 'Name'
$ pnpm run migration:generate ./migrations/Name

# execute the migrations
$ pnpm run migration:run

# revert the most recent migration
$ pnpm run migration:revert
```


## Structure & Responsibilities

This section outlines the general structure of the project. While not all components must be used,
classes should generally be placed in the appropriate directory and used in alignment with the conventions
described below.

### Integration Components

These components are responsible for communication with external APIs. They are divided by the sources they
communicate with and have the following structure:

- **Gateway**: Acts as the point of communication with external infrastructure (APIs).
- **Mapper**: Handles mapping between the domain's used datatype and the request data, utilizing NestJS AutoMapper.
- **Module**: Manages the dependency injection for the component.
- **Spec**: Contains unit tests for the module.
- **Mock**: Provides mock implementations for the module.

### Module Components

Models represent domain-specific business logic flow in the application. Each model is divided into the
following subcategories:

- **Controller**: The entry point for requests, responsible for handling the request and returning the response.
- **Service**: Contains the main business logic.
- **Mapper**: Manages mapping between DTOs received from the frontend and the business logic domain datatype, using NestJS AutoMapper.
- **Module**: Manages the dependency injection for the component.
- **Model**: For more details, see the **Model** section below.
- **Spec**: Contains unit tests for the module.
- **Mock**: Provides mock implementations for the module.

### Common Components

These are components shared between different modules, addressing common concerns:

- **Interfaces**: Common datatypes used across the application.
- **Enums**: Enums defined for the project.
- **Exceptions**: Custom exceptions tailored for the project.
- **Config**: An injectable configuration service used to manage environment variables.
- **Pipes**: Classes implementing the `PipeTransform` interface, used for common validation
  and transformation of data. NestJS provides many built-in pipes, so check the documentation before creating new ones.
- **Gateway**: Acts as the point of communication with external infrastructure (APIs).
- **Utils**: Contains common utility functions that do not meet the criteria for other categories.
- **Filters**: Classes implementing the `ExceptionFilter` interface, used to handle exceptions.
- **Interceptors**: Used to bind extra logic before or after method execution or to extend the behavior of the method.

### Model

Models are used to define the shape and responsibilities of the data:

- **Dto (Data Transfer Object)**: Data sent from/to the frontend.
- **Command**: Datatype used for data manipulation in business logic.
- **Data**: The shape of data from external APIs.

```
Mr.Market-V2/
├── .github/
│ └── workflows/
├── migrations/
├── packages/
│ ├── mm-backend/
│ │ ├── src/
│ │ │ ├── common/
│ │ │ │ ├── config/
│ │ │ │ └── filters/
│ │ │ ├── integrations/
│ │ │ │ ├── integration1/
│ │ │ │   ├── spec/
│ │ │ │   ├── integration1.gateway.ts
│ │ │ │   ├── integration1.mapper.ts
│ │ │ │   └── integration1.module.ts
│ │ │ ├── modules/
│ │ │ │ ├── module1/
│ │ │ │   ├── model/
│ │ │ │   ├── spec/
│ │ │ │   ├── module1.controller.ts
│ │ │ │   ├── module1.service.ts
│ │ │ │   ├── module1.mapper.ts
│ │ │ │   └── module1.module.ts
│ │ │ ├── app.module.ts
│ │ │ ├── app.service.ts
│ │ │ └── main.ts
│ │ ├── test/
│ │ ├── .env.example
│ │ ├── package.json
│ │ ├── vercel.json
│ │ ├── docker-compose.yml
│ │ └── Dockerfile
│ ├── tse-backend/
├──── <structure of tse-backend>
├── .env.example
├── .docker-compose.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

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


# Exchange API Service

This repository provides an API service built using NestJS for retrieving and managing exchange data and trade operations. The API includes two main controllers: `ExchangeDataController` and `ExchangeTradeController`.

## Controllers

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

# License

This project is licensed under the GNU Affero General Public License - see the [LICENSE.md](./LICENSE) file for details