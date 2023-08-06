import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import * as esbuild from 'esbuild';
import type { Builder } from '@sveltejs/kit';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default function () {
	return {
		name: '@zugriff/adapter-sveltekit',
		async adapt(builder: Builder) {
			const zugriff_content = '.zugriff';
			const zugriff_tmp_content = builder.getBuildDirectory('.zugriff_tmp');

			try {
				fs.rmSync(zugriff_tmp_content, { recursive: true, force: true });
			} catch {}
			fs.mkdirSync(path.dirname(zugriff_tmp_content), { recursive: true });

			try {
				fs.rmSync(zugriff_content, { recursive: true, force: true });
			} catch {}
			fs.mkdirSync(path.dirname(zugriff_content), { recursive: true });

			const static_content = `${zugriff_content}/_static${builder.config.kit.paths.base}`;

			await builder.generateFallback(path.join(static_content, '404.html'));
			builder.writeClient(static_content);
			builder.writePrerendered(static_content);

			const relativePath = path.posix.relative(
				zugriff_tmp_content,
				builder.getServerDirectory()
			);

			builder.copy(
				path.join(__dirname, 'request_handler.js'),
				zugriff_tmp_content + '/request_handler.js',
				{
					replace: {
						SERVER: relativePath + '/index.js',
						MANIFEST: './manifest.js',
					},
				}
			);

			writeFile(
				`${zugriff_tmp_content}/manifest.js`,
				`export const manifest = ${builder.generateManifest({
					relativePath,
				})};\n`
			);

			await esbuild.build({
				entryPoints: [zugriff_tmp_content + '/request_handler.js'],
				outfile: zugriff_content + '/_functions/index.js',
				target: 'esnext',
				bundle: true,
				minify: true,
				legalComments: 'none',
				platform: 'browser',
				format: 'esm',
				banner: { js: 'globalThis.global = globalThis;' },
			});

			writeFile(
				zugriff_content + '/_functions/config.json',
				JSON.stringify({
					dynamic: [{ path: '/index.js', regex: '/^.*$/' }],
					static: discoverFiles(static_content),
				})
			);
		},
	};
}

function writeFile(file: string, data: string) {
	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
	} catch {}

	fs.writeFileSync(file, data);
}

function discoverFiles(basePath: string, clean = true): Array<string> {
	let files: Array<string> = [];

	for (const discovery of fs.readdirSync(basePath)) {
		const fullFilePath = path.join(basePath, discovery);
		const discoveryStats = fs.lstatSync(fullFilePath);

		if (discoveryStats.isDirectory()) {
			files = files.concat(discoverFiles(fullFilePath, false));
		} else {
			files.push(fullFilePath);
		}
	}

	if (clean) files = files.map((file) => file.substring(basePath.length));

	return files;
}
