# Backend General Guidelines

This document outlines the architecture, conventions, and important functions used in the backend of this project. It serves as a guide for human developers and AI assistants.

## Architecture Overview

The backend uses **Elysia.js** running on **Cloudflare Workers**.

### Directory Structure (`src/`)

- **`cloudflare/`**: Contains Cloudflare-specific entry points and configurations (e.g., `worker.ts` and Durable Objects).
- **`controller/`**: Contains wide-level application logic. Controllers receive requests from routes and orchestrate calls to services.
- **`services/`**: Contains atomic business logic. Services are responsible for communicating with databases, external APIs, and processing data.
- **`routes/`**: Contains routing endpoints (API paths).
- **`lib/`**: Contains reusable libraries, atomic functions, and utilities (e.g., cryptography, durable object helpers).
- **`scripts/`**: Contains standalone scripts (e.g., database seeding).

### Sample Files Reference

The `src/` directory includes sample files that demonstrate exactly how to structure new features. Before implementing a new feature, review these files as a reference for the correct file content structure and formatting:

```text
src/
├── container.ts               # Shows how to inject SampleService into SampleController and map it to MobileRoutes
├── controller/
│   └── Sample.ts              # Shows how a controller is structured and receives its service dependencies
├── routes/
│   └── sample.routes.ts       # Shows how Elysia route groups are structured and use the controller
└── services/
    └── SampleServices.ts      # Shows how a service class is structured
```

## Dependency Injection (Container Pattern)

The application uses manual dependency injection centralized in **`src/container.ts`**.

When creating a new feature:

1. Create your `Service`.
2. Create your `Controller` and inject the required services into its constructor.
3. Create your `Route` group and pass the controller to it.
4. **Mandatory:** Inject and wire up the new service, controller, and route in `src/container.ts`. Look at existing references in `container.ts` for how to implement things.

## Elysia Routing & OpenAPI Documentation

Elysia natively supports generating OpenAPI/Swagger documentation, and it heavily utilizes **TypeBox** (`t` from `elysia`) to validate incoming requests and outgoing responses.

### Using TypeBox and OpenAPI

When defining routes, always use TypeBox to validate your `body`, `query`, `params`, and `response`. This automatically adds type safety, runtime validation, and populates the OpenAPI documentation.

You should also use the `detail` property on routes to add rich documentation (summary, description, tags) for the Swagger UI.

```typescript
import { t } from "elysia";

// Inside a route group
app.post(
  "/users",
  ({ body }) => {
    // Body is fully typed based on the TypeBox schema!
    return userController.createUser(body.name);
  },
  {
    // 1. Data Validation (TypeBox)
    body: t.Object({
      name: t.String({ description: "The full name of the user" }),
    }),
    response: t.Object({
      success: t.Boolean(),
      id: t.String(),
    }),

    // 2. OpenAPI Documentation
    detail: {
      summary: "Create a new user",
      description: "Creates a new user record in the database and returns the generated ID.",
      tags: ["Users"],
    },
  },
);
```

## Cloudflare Standards

- **Environment Bindings:** To use Cloudflare bindings via import, use the following syntax. This is the recommended standard:
  ```typescript
  import { env } from "cloudflare:workers";
  ```
- **Type Definitions (`Env` Interface):** There is **no need** to blindly add or manually create an `Env` interface. The `Env` interface is automatically generated from `wrangler.jsonc` by running `npm run wrangler-types` (or `npx wrangler types`). You do not even need to manually import it across your files; the TypeScript compiler knows about the generated global types.
- **Worker Entrypoint:** The main entry point is `src/cloudflare/worker.ts`. It exports the main `fetch` handler (delegated to the Elysia app) and `queue` consumers.
- **Durable Objects:** Any Durable Objects must be exported from `src/cloudflare/worker.ts` so that the Cloudflare runtime can discover them.

## Database (Cloudflare D1 & Drizzle ORM)

The backend uses **Cloudflare D1** (serverless SQLite) for database storage and **Drizzle ORM** for type-safe database access.

### Working with Drizzle ORM

When building services that interact with the database:

- Drizzle provides a lightweight, fully typed way to build queries.
- You should pass the D1 database binding into Drizzle to execute queries.
- Schema definitions and queries should be strongly typed, ensuring schema matches your TS interfaces.

```typescript
// Example initialization
import { drizzle } from "drizzle-orm/d1";

export class SampleService {
  private db;
  constructor(d1Binding: D1Database) {
    this.db = drizzle(d1Binding);
  }

  async getUsers() {
    // return await this.db.select().from(users).all();
  }
}
```

## Important Atomic Functions

Pay special attention to these utilities when implementing features that require security or tokens.

### Cryptography (`src/lib/crypto/`)

1. **JWT (`jwt.ts`)**: Uses the `jose` library for Edge-compatible JWT signing and verification.
   - Designed to return a tuple-like result object: `{ data, error }` instead of throwing exceptions.
   - `jwtEncrypt({ payload, secretKey, expiresInSeconds })`: Signs a JWT.
   - `jwtDecrypt({ token, secretKey })`: Verifies a JWT and extracts the payload.
2. **Hashing (`hash.ts`)**: Uses the native Web Crypto API (`crypto.subtle`).
   - `hash(data)`: Creates a salted SHA-256 hash. Returns a combined string in the format `<saltHex>$<hashHex>`.
   - `verifyHash(data, hashToVerify)`: Verifies a hash. Gracefully supports both the newer salted format (`salt$hash`) and legacy unsalted hashes.

---

## WebSockets in Durable Objects

When implementing real-time features (e.g., chat, live updates, or multiplayer interactions), use **Cloudflare Durable Objects** combined with WebSockets. This ensures all participants connecting to a specific "room" or "topic" share the same centralized state.

### Key Concepts

1. **Handling the Upgrade Request**:
   The initial HTTP request to the Durable Object must be upgraded to a WebSocket connection. To simplify this, the project provides a `makeWSServer` utility in `src/lib/durable-object.ts`.

2. **Using `makeWSServer`**:
   This utility automatically creates a `WebSocketPair`, calls `ctx.acceptWebSocket(server)`, and constructs the 101 Switching Protocols response. It returns `{ response, client, server }`.

3. **Attachments**:
   You can attach metadata (like user IDs or room IDs) directly to the socket via `server.serializeAttachment({ ... })`. This makes it easy to identify _who_ sent a message without them needing to re-authenticate on every payload.

4. **Broadcasting vs. Direct Messaging**:
   - Send to one: `server.send(JSON.stringify({ type: 'hello' }))`
   - Send to all: Iterate through `this.ctx.getWebSockets()` and call `.send()`.

### General Implementation Template

Use the following simplified blueprint when building a new real-time feature.

```typescript
import { makeWSServer } from "../lib/durable-object";

export class BaseRealtimeDurableObject extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    // 1. Identify the intent (e.g., via search params or path)
    const url = new URL(request.url);
    const intent = url.searchParams.get("action");

    // 2. Validate prerequisites
    if (intent !== "JOIN") {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    // 3. Perform any necessary async business logic *before* upgrading
    // e.g., verifying user identity, checking permissions, updating DB
    const userId = url.searchParams.get("userId");

    // 4. Upgrade to WebSocket using the project's utility
    const { response, server } = makeWSServer(this.ctx);

    // 5. Attach contextual data to the socket for easy retrieval later
    server.serializeAttachment({ userId, joinedAt: Date.now() });

    // 6. (Optional) Send initial state or welcome message
    server.send(JSON.stringify({ type: "WELCOME", payload: { message: "Connected!" } }));

    // 7. Return the response to complete the handshake
    return response;
  }

  // Handle incoming messages from connected clients
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // Retrieve metadata (who is this?)
    const attachment = ws.deserializeAttachment();

    // Parse the message
    const data = typeof message === "string" ? JSON.parse(message) : message;

    // Process logic based on message content...

    // Broadcast to others if needed
    const allSockets = this.ctx.getWebSockets();
    for (const socket of allSockets) {
      if (socket !== ws) {
        socket.send(JSON.stringify({ type: "BROADCAST", payload: data }));
      }
    }
  }

  // Clean up on disconnect
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    const attachment = ws.deserializeAttachment();
    console.log(`User ${attachment.userId} left.`);
  }
}
```
