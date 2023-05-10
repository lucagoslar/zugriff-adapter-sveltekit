// @ts-ignore
import { Server } from 'SERVER';
// @ts-ignore
import { manifest } from 'MANIFEST';

const server = new Server(manifest);
const initialized = server.init({
	env: process.env,
});

export async function handler(request: Request) {
	await initialized;
	return server.respond(request, {});
}
