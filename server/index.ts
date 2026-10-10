import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';

import authRouter from './routes/auth.js';
import culturesRouter from './routes/cultures.js';
import resourcesRouter from './routes/resources.js';
import savedResourcesRouter from './routes/savedResources.js';
import coursesRouter from './routes/courses.js';
import contributionsRouter from './routes/contributions.js';
import knowledgeGapsRouter from './routes/knowledgeGaps.js';
import contributorsRouter from './routes/contributors.js';
import aiRouter from './routes/ai.js';
import paymentsRouter from './routes/payments.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database schema and seeds
initDatabase();

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/cultures', culturesRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/saved-resources', savedResourcesRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/contributions', contributionsRouter);
app.use('/api/knowledge-gaps', knowledgeGapsRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'CultureVerse API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[CultureVerse Server] Running on http://localhost:${PORT}`);
});
