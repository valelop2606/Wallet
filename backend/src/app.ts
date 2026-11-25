import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler';
import { openApiSpec } from './docs/openapi';
import routes from './routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // behind Render's proxy: needed for per-IP rate limiting

  // API docs (mounted before helmet so Swagger UI's inline assets aren't blocked by CSP)
  app.get('/api/docs.json', (_req, res) => res.json(openApiSpec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', routes);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Unknown API routes → JSON 404 (instead of falling through to the SPA)
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Serve frontend static files in production
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  app.use(errorHandler);

  return app;
}
