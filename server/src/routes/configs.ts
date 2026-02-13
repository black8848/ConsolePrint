import { Router } from 'express';
import { query, queryOne, run } from '../db/index.js';
import type { Config, CreateConfig } from '../types/index.js';

const router = Router();

// Get configs for an issue
router.get('/issue/:issueId', (req, res) => {
  const configs = query<Config>(
    'SELECT * FROM configs WHERE issueId = ? ORDER BY createdAt',
    [req.params.issueId]
  );
  res.json(configs);
});

// Create config
router.post('/', (req, res) => {
  const { issueId, key, value, note } = req.body as CreateConfig;

  const { lastId } = run(
    'INSERT INTO configs (issueId, key, value, note) VALUES (?, ?, ?, ?)',
    [issueId, key, value || '', note || null]
  );

  const config = queryOne<Config>('SELECT * FROM configs WHERE id = ?', [lastId]);
  res.status(201).json(config);
});

// Update config
router.put('/:id', (req, res) => {
  const { key, value, note } = req.body;

  run(
    'UPDATE configs SET key = ?, value = ?, note = ? WHERE id = ?',
    [key, value || '', note || null, req.params.id]
  );

  const config = queryOne<Config>('SELECT * FROM configs WHERE id = ?', [req.params.id]);
  res.json(config);
});

// Delete config
router.delete('/:id', (req, res) => {
  run('DELETE FROM configs WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

export default router;
