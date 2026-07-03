import { createServer } from 'vite';

const server = await createServer({
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
});

await server.listen();

const localUrl = server.resolvedUrls?.local?.[0] ?? 'http://127.0.0.1:5173/';
console.log(`Local: ${localUrl}`);

setInterval(() => {}, 2147483647);
