// Test if we can at least respond to requests
console.log('[v0] API handler loaded');

module.exports = async function handler(req, res) {
  try {
    console.log('[v0] Request received:', req.method, req.url);
    
    // First, just test that we can respond
    res.status(200).json({ 
      message: 'API handler is working',
      request: { method: req.method, url: req.url }
    });
  } catch (error) {
    console.error('[v0] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
