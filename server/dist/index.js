import express from 'express';
import cors from 'cors';
import { initDb } from './db/index.js';
import issuesRouter from './routes/issues.js';
import configsRouter from './routes/configs.js';
import logsRouter from './routes/logs.js';
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/issues', issuesRouter);
app.use('/api/configs', configsRouter);
app.use('/api/logs', logsRouter);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Initialize database and start server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
