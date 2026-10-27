// Local browser regression check: delay HD images to exercise mobile request latency.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';

const root = resolve('dist');
const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml'};
createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  try {
    const bytes = await readFile(file);
    if (pathname.startsWith('/walkthrough-hd/')) await new Promise(resolve => setTimeout(resolve, 650));
    response.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
    response.end(bytes);
  } catch { response.writeHead(404).end(); }
}).listen(5174, '127.0.0.1', () => console.log('Slow-network preview: http://127.0.0.1:5174 (650ms HD image latency)'));
