import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { processDdtSummaryRequest } from './src/server/ddtGenerator';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body parser limits for media base64 uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Main AI Generation Endpoint for DDT Summary
app.post('/api/generate-summary', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is missing. Please set your API key in Secrets / environment variables.',
      });
    }

    const caseSummary = await processDdtSummaryRequest(req.body, apiKey);
    res.json({ success: true, caseSummary });
  } catch (error: any) {
    console.error('Error generating DDT summary in Express server:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate case summary. Please check logs.',
    });
  }
});

// Setup Vite Development Server or Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DDT Case Summary Generator server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
