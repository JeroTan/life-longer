import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'

new Elysia({ adapter: CloudflareAdapter })
  .get("/", () => ({ hello: "Node.js👋" }))
  .compile()

console.log(`Listening on http://localhost:3000`);
