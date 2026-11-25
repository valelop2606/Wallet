import { config } from './config/env';
import { testConnection } from './database/connection';
import { createApp } from './app';

const app = createApp();

async function start(): Promise<void> {
  try {
    await testConnection();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
