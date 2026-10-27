// Starts the reference KB server with the sample documents (data lives in memory only).
// Usage: npm run kb-server   (port from KB_PORT, default 3000)
import { createKBServer } from './server';

const port = Number(process.env.KB_PORT ?? 3000);

createKBServer().listen(port, () => {
  console.log(`KB server listening on http://localhost:${port} (in-memory sample data, Ctrl+C to stop)`);
});
