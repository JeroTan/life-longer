import Elysia from "elysia";
import { mainApp } from "../main";

export * from "./durable-objects/Payment";

export default {
  async fetch(request) {
    return mainApp.handle(request);
  },
  async queue(batch, _env) {
    let messages = JSON.stringify(batch.messages);
    console.log(`consumed from our queue: ${messages}`);
  },
} satisfies ExportedHandler<Env>;
