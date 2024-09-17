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