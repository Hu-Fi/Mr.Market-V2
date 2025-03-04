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

---

### Running the Application Without Docker

Follow these steps to run both `mm-backend` and `tse-backend` concurrently without Docker. Make sure that **Redis** and **PostgreSQL** are running separately before proceeding, and properly configure their connection details in the `.env` files.

#### Running Both Applications Simultaneously

1. Ensure that **Redis** and **PostgreSQL** are running, and the necessary database for both apps has been created.

2. Copy the `.env.example` files to `.env` for both `mm-backend` and `tse-backend`:

    ```sh
    cp packages/mm-backend/.env.example packages/mm-backend/.env
    cp packages/tse-backend/.env.example packages/tse-backend/.env
    ```

3. If you are using a local PostgreSQL database, set the `DATABASE_SSL` flag to `false` in both `.env` files.
4. Complete the required environment variables related to the **Mixin application**.
   These values are crucial for the proper functioning of the Mixin integration.
5. Set a secure **ADMIN_PASSWORD** in the `.env`

6. From the root directory, run the following command to start both applications simultaneously:

    ```sh
    pnpm run start
    ```
