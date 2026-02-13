import { Router } from 'express';
import { query, queryOne, run } from '../db/index.js';
import type { ConsoleLog, CreateConsoleLog } from '../types/index.js';

const router = Router();

// Get logs for an issue
router.get('/issue/:issueId', (req, res) => {
  const logs = query<ConsoleLog>(
    'SELECT * FROM console_logs WHERE issueId = ? ORDER BY createdAt DESC',
    [req.params.issueId]
  );
  res.json(logs);
});

// Create log
router.post('/', (req, res) => {
  const { issueId, prompt, command, output, note, logType } = req.body as CreateConsoleLog;

  const { lastId } = run(
    'INSERT INTO console_logs (issueId, prompt, command, output, note, logType) VALUES (?, ?, ?, ?, ?, ?)',
    [issueId, prompt || '', command || '', output || '', note || null, logType || 'info']
  );

  const log = queryOne<ConsoleLog>('SELECT * FROM console_logs WHERE id = ?', [lastId]);
  res.status(201).json(log);
});

// Update log
router.put('/:id', (req, res) => {
  const { prompt, command, output, note, logType } = req.body;

  run(
    'UPDATE console_logs SET prompt = ?, command = ?, output = ?, note = ?, logType = ? WHERE id = ?',
    [prompt || '', command || '', output || '', note || null, logType || 'info', req.params.id]
  );

  const log = queryOne<ConsoleLog>('SELECT * FROM console_logs WHERE id = ?', [req.params.id]);
  res.json(log);
});

// Delete log
router.delete('/:id', (req, res) => {
  run('DELETE FROM console_logs WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

export default router;
