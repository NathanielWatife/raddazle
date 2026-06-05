import { VercelRequest, VercelResponse } from '@vercel/node';

let serverInstance: any = null;

async function getServer() {
  if (!serverInstance) {
    try {
      const serverModule = await import('../dist/server/server.js');
      serverInstance = serverModule.default;
      console.log('[v0] Server loaded successfully');
    } catch (error) {
      console.error('[v0] Failed to load server:', error);
      throw error;
    }
  }
  return serverInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[v0] Request:', req.method, req.url);
    
    const server = await getServer();
    console.log('[v0] Server instance:', typeof server);
    
    if (!server || typeof server.fetch !== 'function') {
      return res.status(500).json({ error: 'Server not available' });
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url}`;

    const headers: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (key !== 'host' && key !== 'content-length' && value !== undefined) {
        headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    });

    const requestInit: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      requestInit.body = bodyStr;
    }

    const response = await server.fetch(new Request(url, requestInit));
    res.status(response.status);

    response.headers.forEach((value: string, key: string) => {
      if (key.toLowerCase() !== 'content-length') {
        res.setHeader(key, value);
      }
    });

    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('[v0] Handler error:', error);
    res.status(500).json({
      error: 'Internal error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
