import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api';
import { initializeServices } from './routes/api';
import { ApiConfig } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

const apiConfig: ApiConfig = {
  pexels: {
    apiKey: process.env.PEXELS_API_KEY || '',
    baseUrl: 'https://api.pexels.com',
  },
  pixabay: {
    apiKey: process.env.PIXABAY_API_KEY || '',
    baseUrl: 'https://pixabay.com/api',
  },
  unsplash: {
    accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
    baseUrl: 'https://api.unsplash.com',
  },
};

initializeServices(apiConfig);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('API Keys configured:');
  console.log(`  Pexels: ${apiConfig.pexels.apiKey ? '✓' : '✗ (not set)'}`);
  console.log(`  Pixabay: ${apiConfig.pixabay.apiKey ? '✓' : '✗ (not set)'}`);
  console.log(`  Unsplash: ${apiConfig.unsplash.accessKey ? '✓' : '✗ (not set)'}`);
});

export default app;