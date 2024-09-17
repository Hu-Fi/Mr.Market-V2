## Running the unit and e2e tests

### Unit tests using Jest library

1. Running the unit tests using CLI
    ```sh
    pnpm test
    ```
2. GitHub Continuous Integration workflow
- `.github/workflows/ci-test-tse-backend.yaml`
- `.github/workflows/ci-test-mm-backend.yaml`

### Integration tests using Jest and TestContainers libraries

1. Running tests using CLI
    ```sh
    pnpm test:e2e
    ```
2. GitHub Continuous Integration workflow
- `.github/workflows/ci-test-tse-backend.yaml`
- `.github/workflows/ci-test-mm-backend.yaml`
