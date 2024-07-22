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

# License

This project is licensed under the GNU Affero General Public License - see the [LICENSE.md](./LICENSE) file for details