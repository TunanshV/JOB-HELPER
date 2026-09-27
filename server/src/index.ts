import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { connectDatabase } from './db.js';
import routes from './routes.js';

const app = express();
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', routes);

connectDatabase().then(() => {
  app.listen(config.port, () => console.log(`CareerFlow API listening on http://localhost:${config.port}`));
}).catch((error: unknown) => {
  console.error('Database connection failed.', error);
  process.exit(1);
});
