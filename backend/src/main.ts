import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import { Container } from "./container";

export const mainApp = Container(new Elysia({ adapter: CloudflareAdapter,  aot: false })
  .use(openapi())
  .compile())

