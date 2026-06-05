const path = require('path');

let serverInstance = null;

async function getServer() {
  if (!serverInstance) {
    try {
      // Use require.resolve to get the absolute path to server.js
      const serverPath = require.resolve('../dist/server/server.js');
      console.log('[v0] Server path:', serverPath);
      
      // Clear the require cache to always get a fresh instance
      delete require.cache[serverPath];
      
      // Import the server module
      const serverModule = require(serverPath);
      serverInstance = serverModule.default || serverModule;
      
      console.log('[v0] Server instance imported successfully');
      console.log('[v0] Server type:', typeof serverInstance);
      console.log('[v0] Server keys:', Object.keys(serverInstance || {}).slice(0, 10));
    } catch (error) {
      console.error('[v0] Failed to import server:', error);
      console.error('[v0] Error message:', error.message);
      console.error('[v0] Error stack:', error.stack);
      throw error;
    }
  }
  return serverInstance;
}

module.exports = async function handler(req, res) {
  try {
    console.log('[v0] ===== Handling request =====');
    console.log('[v0] Method:', req.method);
    console.log('[v0] URL:', req.url);
    console.log('[v0] Headers:', Object.keys(req.headers).join(', '));
    
    const server = await getServer();
    
    if (!server) {
      console.error('[v0] Server instance is null');
      return res.status(500).json({ error: 'Server instance is null' });
    }
    
    if (typeof server.fetch !== 'function') {
      console.error('[v0] Server does not have fetch method. Type:', typeof server, 'Keys:', Object.keys(server).slice(0, 10));
      return res.status(500).json({ error: 'Server does not have fetch method' });
    }

    console.log('[v0] Server fetch method found');

    // Construct the full URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const fullPath = req.url || '/';
    const url = `${protocol}://${host}${fullPath}`;
    
    console.log('[v0] Calling server.fetch with URL:', url);

    // Build headers
    const headers = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (key !== 'host' && key !== 'content-length' && value !== undefined) {
        headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    });

    // Build request init
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

    // Create and send the request
    const serverRequest = new Request(url, requestInit);
    const response = await server.fetch(serverRequest);
    
    console.log('[v0] Server response received, status:', response.status);

    // Set response status
    res.status(response.status);

    // Copy response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-length') {
        res.setHeader(key, value);
      }
    });

    // Get response body
    const body = await response.text();
    console.log('[v0] Response body length:', body.length);
    console.log('[v0] Sending response with status:', response.status);
    
    res.send(body);
  } catch (error) {
    console.error('[v0] ===== Handler Error =====');
    console.error('[v0] Error type:', error?.constructor?.name);
    console.error('[v0] Error message:', error?.message);
    console.error('[v0] Error stack:', error?.stack);
    
    res.status(500).json({
      error: 'Internal server error',
      message: error?.message || 'Unknown error',
    });
  }
};
