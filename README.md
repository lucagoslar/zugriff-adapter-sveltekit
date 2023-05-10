## zugriff-adapter-sveltekit

Deploy your SvelteKit applications with zugriff at the edge.

[![build and test package](https://github.com/lucagoslar/zugriff-adapter-sveltekit/actions/workflows/main.yml/badge.svg)](https://github.com/lucagoslar/zugriff-adapter-sveltekit/actions/workflows/main.yml)

## Usage

Install the adapter and replace your old one as follows.

```
  npm i --save-dev @zugriff/adapter-sveltekit
```

```js
import adapter from '@zugriff/adapter-sveltekit';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  ...
	kit: {
    ...
		adapter: adapter(),
	},
};

export default config;
```

\
_And off we go …_
