## Running the Application

> **Note:** The instructions below describe how to run the application in a local development environment and are not intended for production deployment.

### Running the Entire Application Using the Main `docker-compose.yml`

1. Navigate to the root directory of the project.
2. Copy the `.env.example` files to `.env` and adjust the environment variables:

    ```sh
    cp .env.example .env
    ```

3. Important environment variables to configure:
   - **Database settings**: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`, `DATABASE_PORT`
   - **Mixin API credentials**: `MIXIN_APP_ID`, `MIXIN_SESSION_ID`, `MIXIN_SERVER_PUBLIC_KEY`, `MIXIN_SESSION_PRIVATE_KEY`, `MIXIN_SPEND_PRIVATE_KEY`
   - **Authentication**: `ADMIN_PASSWORD`
   - **Mixin OAuth**: `MIXIN_OAUTH_SECRET`, `MIXIN_OAUTH_SCOPE`
   - **Database options**: `DATABASE_LOGGING_LEVEL`, `DATABASE_SYNCHRONIZE`, `DATABASE_AUTO_RUN_MIGRATIONS`, `DATABASE_SSL`
   - **Trading Strategy Execution**: `SANDBOX` (for tse-backend)

4. Run Docker Compose:

    ```sh
    docker-compose up --build
    ```
   
---

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

3. Run the application.

    ```sh
    pnpm run start
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

3. Run the application.

    ```sh
    pnpm run start
    ```

---

### Running the Application Without Docker

> **Note:** Follow these steps to run both `mm-backend` and `tse-backend` concurrently without Docker.   
Make sure that **Redis** and **PostgreSQL** are running separately before proceeding, and properly configure their connection details in the `.env` files.

1. Copy the `.env.example` files to `.env` for both `mm-backend` and `tse-backend`:

    ```sh
    cp packages/mm-backend/.env.example packages/mm-backend/.env
    cp packages/tse-backend/.env.example packages/tse-backend/.env
    ```

2. If you are using a local PostgreSQL database, set the `DATABASE_SSL` flag to `false` in both `.env` files.
3. Complete the required environment variables related to the **Mixin application**.
   These values are crucial for the proper functioning of the Mixin integration.
4. Set a secure **ADMIN_PASSWORD** in the `.env`

5. From the root directory, run the following command to start both applications simultaneously:

    ```sh
    pnpm run start
    ```
---
