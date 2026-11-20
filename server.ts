import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createOrderHandler from './api/create-order.js';
import verifyPaymentHandler from './api/verify-payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Mount Razorpay API routes (both clean paths and .js paths for compatibility)
  app.post('/api/create-order', (req, res) => {
    void createOrderHandler(req, res);
  });
  app.post('/api/create-order.js', (req, res) => {
    void createOrderHandler(req, res);
  });

  app.post('/api/verify-payment', (req, res) => {
    void verifyPaymentHandler(req, res);
  });
  app.post('/api/verify-payment.js', (req, res) => {
    void verifyPaymentHandler(req, res);
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DawaiDost server listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
