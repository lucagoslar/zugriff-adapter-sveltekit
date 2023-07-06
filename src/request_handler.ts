// @ts-ignore
import { Server } from 'SERVER';
// @ts-ignore
import { manifest } from 'MANIFEST';

const server = new Server(manifest);
const initialized = server.init({
	env: process.env,
});

addEventListener('fetch', async (request: zugriffRequest) => {
	await initialized;
	request.respondWith(server.respond(request, {}));
});
