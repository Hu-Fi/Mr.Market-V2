
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
