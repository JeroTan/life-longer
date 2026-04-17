## Context

The backend is built with ElysiaJS and Cloudflare Workers, and we recently migrated database interactions to use Drizzle ORM. As the backend handles critical workflows—like authentication, credit deduction, and scientific calculations—we need a robust way to verify that these endpoints behave as expected. 

## Goals / Non-Goals

**Goals:**
- Add a testing library suitable for ElysiaJS applications (e.g., `bun test` is native to Elysia, but since this is a Node environment based on package.json, we will likely use `vitest` or a similar test runner compatible with the setup).
- Write endpoint integration tests for Auth, User, Payment, and Analysis routes.
- Ensure the tests can mock the D1 Database and `env` variables, or run against a local Miniflare/wrangler environment.

**Non-Goals:**
- End-to-end (E2E) testing with the React Native mobile app.
- Achieving 100% test coverage in this initial pass; the focus is on the critical paths (auth, payments, analysis).

## Decisions

- **Testing Framework**: We will use `vitest` because it integrates well with TypeScript, provides excellent mocking capabilities, and works in Node environments. We might also need `unstable_dev` from wrangler or just mock the `env` and DB for unit-like integration testing.
- **Mocking**: For external APIs like Google OAuth and Lemon Squeezy, we will mock the `fetch` calls or the Services themselves to avoid hitting real APIs during tests.

## Risks / Trade-offs

- **Risk**: Mocking D1 can be complex if we don't have a local SQLite setup matching the D1 API perfectly.
  - **Mitigation**: We can use `better-sqlite3` or a similar local SQLite binding in tests to simulate D1, or use Cloudflare's testing utilities.
