let serverInstance = null;

async function getServer() {
  if (!serverInstance) {
    try {
      const serverModule = await import('../dist/server/server.js');
      serverInstance = serverModule.default;
      console.log('[v0] Server instance imported successfully');
    } catch (error) {
      console.error('[v0] Failed to import server:', error);
      throw error;
    }
  }
  return serverInstance;
}

module.exports = async function handler(req, res) {
  try {
    console.log('[v0] Incoming request:', { method: req.method, url: req.url });
    
    const server = await getServer();
    console.log('[v0] Server instance loaded:', !!server);
    console.log('[v0] Server has fetch method:', typeof server?.fetch === 'function');

    // Construct the request URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    
    // Get the full URL with query params
    let fullPath = req.url || '/';
    const url = `${protocol}://${host}${fullPath}`;
    console.log('[v0] Constructed URL:', url);

    // Build headers object for the Request
    const headers = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (key !== 'host' && key !== 'content-length' && value !== undefined) {
        headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    });

    const requestInit = {
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

    console.log('[v0] Request init:', { method: requestInit.method, headers: Object.keys(headers) });

    // Call the server's fetch method
    const serverRequest = new Request(url, requestInit);
    console.log('[v0] Calling server.fetch with URL:', url);
    
    const response = await server.fetch(serverRequest);
    
    console.log('[v0] Server response status:', response.status);
    console.log('[v0] Server response headers:', Array.from(response.headers.entries()));

    // Set response status
    res.status(response.status);

    // Copy response headers
    response.headers.forEach((value, key) => {
      // Skip content-length as Vercel will calculate it
      if (key.toLowerCase() !== 'content-length') {
        res.setHeader(key, value);
      }
    });

    // Send response body
    const body = await response.text();
    console.log('[v0] Response body length:', body.length);
    
    // Ensure we send the response correctly
    if (response.status >= 300 && response.status < 400) {
      // Handle redirects
      const location = response.headers.get('location');
      if (location) {
        res.setHeader('Location', location);
      }
    }
    
    res.send(body);
  } catch (error) {
    console.error('[v0] Handler error:', error);
    console.error('[v0] Error stack:', error?.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: error?.message || 'Unknown error',
      stack: error?.stack,
    });
  }
};
