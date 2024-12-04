# Employee Management(Backend)

This project is a modern API server built with **Apollo GraphQL** and **Prisma**. It provides a scalable and efficient way to handle GraphQL queries and mutations, with Prisma serving as the ORM for database operations.

## Features

- **GraphQL API**: A fully-featured GraphQL API built with Apollo Server.
- **Prisma ORM**: Simplifies database interactions with type-safe and fast queries.

1. Clone the repository:

   ```bash
   git clone https://github.com/Abdulahadniaz/employee-management-api.git
   cd employee-management-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   Create a `.env` file at the root of the project and configure your database connection. Example:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase"
   JWT_SECRET="your-secret-jwt-token"
   ```

   Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

   Run Prisma migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

## Usage

Once the server is running, you can access the GraphQL Playground at:

```
http://localhost:4000/graphql
```