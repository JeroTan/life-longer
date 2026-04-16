import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import { Container } from "./container";

export const mainApp = new Elysia({ adapter: CloudflareAdapter,  aot: false, normalize: true })
  .use(openapi())
Container(mainApp);

