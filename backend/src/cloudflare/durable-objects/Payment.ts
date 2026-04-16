import { DurableObject } from "cloudflare:workers";

export class Payment extends DurableObject<Env> {

	constructor(state: DurableObjectState, env: Cloudflare.Env) {
		super(state, env);  
	}
	async fetch(request: Request): Promise<Response> {
		// Return websocket or response here
		return new Response("Hello from Durable Object");
	}

	webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {}
	webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {}
	async webSocketError(ws: WebSocket, error: unknown) {}

	async __sampleCustomFunction(){
		return "Sample Custom Function Result";
	}
}