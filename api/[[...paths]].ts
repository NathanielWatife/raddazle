import { VercelRequest, VercelResponse } from '@vercel/node';

// Dynamically import the server to allow for proper Node.js environment
let serverInstance: any = null;

async function getServer() {
  if (!serverInstance) {
    try {
      const { default: server } = await import('../dist/server/server.js');
      serverInstance = server;
    } catch (error) {
      console.error('[v0] Failed to import server:', error);
      throw error;
    }
  }
  return serverInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const server = await getServer();

    // Construct the request URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url}`;

    // Create a Request object for the server's fetch handler
    const requestInit: RequestInit = {
      method: req.method,
      headers: Object.entries(req.headers).reduce((acc, [key, value]) => {
        if (key !== 'host' && value !== undefined) {
          acc[key] = Array.isArray(value) ? value.join(', ') : value;
        }
        return acc;
      }, {} as Record<string, string>),
    };

    // Add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      const bodyStr = typeof req.body === 'string' 
        ? req.body 
        : JSON.stringify(req.body);
      requestInit.body = bodyStr;
    }

    // Call the server's fetch method
    const response = await server.fetch(new Request(url, requestInit));

    // Set response status
    res.status(response.status);

    // Copy response headers
    response.headers.forEach((value: string, key: string) => {
      // Skip content-length as Vercel will calculate it
      if (key.toLowerCase() !== 'content-length') {
        res.setHeader(key, value);
      }
    });

    // Send response body
    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('[v0] Handler error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
