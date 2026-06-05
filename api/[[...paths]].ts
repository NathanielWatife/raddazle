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
    console.log('[v0] Incoming request:', { method: req.method, url: req.url });
    
    const server = await getServer();
    console.log('[v0] Server instance loaded:', !!server);

    // Construct the request URL - use / as root path for the server
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    
    // Get the pathname from the API route
    let pathname = req.url || '/';
    // Remove any query parameters
    if (pathname.includes('?')) {
      pathname = pathname.split('?')[0];
    }
    
    const url = `${protocol}://${host}${pathname}${req.url?.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
    console.log('[v0] Constructed URL:', url);

    // Create a Request object for the server's fetch handler
    const headers: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (key !== 'host' && key !== 'content-length' && value !== undefined) {
        headers[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    });

    const requestInit: RequestInit = {
      method: req.method,
      headers,
    };

    // Add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      const bodyStr = typeof req.body === 'string' 
        ? req.body 
        : JSON.stringify(req.body);
      requestInit.body = bodyStr;
    }

    console.log('[v0] Request init:', { method: requestInit.method, url, headersCount: Object.keys(headers).length });

    // Call the server's fetch method
    const response = await server.fetch(new Request(url, requestInit));
    
    console.log('[v0] Server response status:', response.status);

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
    console.log('[v0] Response body length:', body.length);
    res.send(body);
  } catch (error) {
    console.error('[v0] Handler error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
