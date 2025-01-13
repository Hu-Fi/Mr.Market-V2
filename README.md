**This is still in development and not ready for use. If you would like to test out Mr.Market, you can try the alpha V1 version available [here](https://github.com/Hu-Fi/Mr.Market/tree/main).**

# Introduction

## What is Mr.Market?

Mr.Market is a Trading bot and the reference exchange oracle for Hu-Fi. Mr.Market has three main functions:

- An automated CeFi, DeFi, TradFi  bot that supports a variety of strategies for arbitrage.
- A front end where users can transact using crypto, and tradfi accounts .

Learn more about [Hu-Fi](https://github.com/hu-fi).

### Mr.Market V1

You can find the V1 alpha version [here](https://github.com/Hu-Fi/Mr.Market/tree/main).

## What is Mr.Market V2?

Mr.Market V2 is the improved version of Mr.Market V1. While V1 was built with a time-to-market priority in mind, V2 features a new architecture designed to be more robust and scalable.

You can find the V2 high-level architecture overview [here](./MrMarket%20-%20V2%20architecture.md).

## Documentation

Below are links to the documentation files located in the `architecture/docs` folder:

- [PROJECT_STRUCTURE.md](architecture/docs/PROJECT_STRUCTURE.md)
- [HOW_TO_DEPLOY.md](architecture/docs/HOW_TO_DEPLOY.md)
- [HOW_TO_RUN_APP.md](architecture/docs/HOW_TO_RUN_APP.md)
- [HOW_TO_RUN_TESTS.md](architecture/docs/HOW_TO_RUN_TESTS.md)
- [HTTP_API.md](architecture/docs/HTTP_API.md)
- [WEBSOCKET.md](architecture/docs/WEBSOCKET.md)

## Vercel Deploy Button

| Project     | Deploy                                                                                                                                                                                                                                           |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| tse-backend | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHu-Fi%2FMr.Market-V2%2Ftree%2Fmain%2Fpackages%2Ftse-backend)                                                                                                                                                                                                                                                |
| mm-backend  | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHu-Fi%2FMr.Market-V2%2Ftree%2Fmain%2Fpackages%2Fmm-backend&env=TRADING_STRATEGY_EXECUTION_API,ADMIN_PASSWORD,MIXIN_APP_ID,MIXIN_SESSION_ID,MIXIN_SERVER_PUBLIC_KEY,MIXIN_SESSION_PRIVATE_KEY,MIXIN_SPEND_PRIVATE_KEY,MIXIN_OAUTH_SECRET) |

1. Start the deployment
- First, you should run the `tse-backend`, just click the deploy button (not need to provide any environment variables).
- Second you should run the mm-backend.
2. Add storage
- In the Add Storage section, select the Postgres Database option available to you. The Vercel integration will create and provision a Postgres database, and you should manually connect it to your new projects.
- Do the same for Redis.

### Required Environment Variables for `mm-backend`

| Variable                        | Description                                                                                 |
|---------------------------------|---------------------------------------------------------------------------------------------|
| `TRADING_STRATEGY_EXECUTION_API` | The API endpoint for executing trading strategies.                                         |
| `ADMIN_PASSWORD`                | Admin password for accessing restricted endpoints.                              |
| `MIXIN_APP_ID`                  | The Mixin application ID.                                                                  |
| `MIXIN_SESSION_ID`              | The session ID for the Mixin integration.                                                 |
| `MIXIN_SERVER_PUBLIC_KEY`       | Public key for the Mixin server.                                                           |
| `MIXIN_SESSION_PRIVATE_KEY`     | Private key for the Mixin session.                                                         |
| `MIXIN_SPEND_PRIVATE_KEY`       | Private key for Mixin spend operations.                                                    |
| `MIXIN_OAUTH_SECRET`            | OAuth secret for the Mixin integration.                                                   |

# License

This project is licensed under the GNU Affero General Public License - see the [LICENSE.md](./LICENSE) file for details
