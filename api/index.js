let serverInstance = null;

async function getServer() {
  if (!serverInstance) {
    try {
      console.log('[v0] Attempting to import server via .mjs wrapper');
      // Use dynamic import with a .mjs file that can properly import the ES module
      const { server } = await import('./server-wrapper.mjs');
      serverInstance = server;
      console.log('[v0] Server imported successfully');
      console.log('[v0] Server type:', typeof serverInstance);
    } catch (error) {
      console.error('[v0] Failed to import server:', error.message);
      console.error('[v0] Stack:', error.stack);
      throw error;
    }
  }
  return serverInstance;
}

module.exports = async function handler(req, res) {
  try {
    console.log('[v0] Request:', req.method, req.url);
    
    const server = await getServer();
    console.log('[v0] Server loaded:', !!server);
    console.log('[v0] Has fetch:', typeof server?.fetch === 'function');

    if (!server || typeof server.fetch !== 'function') {
      console.error('[v0] Invalid server object');
      return res.status(500).json({ error: 'Invalid server object' });
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url}`;

    const headers = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (key !== 'host' && key !== 'content-length' && value !== undefined) {
        headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    });

    const requestInit = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      requestInit.body = bodyStr;
    }

    const response = await server.fetch(new Request(url, requestInit));
    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-length') {
        res.setHeader(key, value);
      }
    });

    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('[v0] Error:', error.message);
    console.error('[v0] Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};
