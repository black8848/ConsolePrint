import { Router } from 'express';
import { query, queryOne, run } from '../db/index.js';
import type { Issue, CreateIssue, UpdateIssue } from '../types/index.js';

const router = Router();

// Get all issues
router.get('/', (req, res) => {
  const issues = query<Issue>('SELECT * FROM issues ORDER BY createdAt DESC');
  res.json(issues);
});

// Get single issue with configs and logs
router.get('/:id', (req, res) => {
  const issue = queryOne<Issue>('SELECT * FROM issues WHERE id = ?', [req.params.id]);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const configs = query('SELECT * FROM configs WHERE issueId = ? ORDER BY createdAt', [req.params.id]);
  const logs = query('SELECT * FROM console_logs WHERE issueId = ? ORDER BY createdAt DESC', [req.params.id]);

  res.json({ ...issue, configs, logs });
});

// Create issue
router.post('/', (req, res) => {
  const { title, description, location, impact, status } = req.body as CreateIssue;

  const { lastId } = run(
    'INSERT INTO issues (title, description, location, impact, status) VALUES (?, ?, ?, ?, ?)',
    [title, description || '', location || '', impact || '', status || 'open']
  );

  const issue = queryOne<Issue>('SELECT * FROM issues WHERE id = ?', [lastId]);
  res.status(201).json(issue);
});

// Update issue
router.put('/:id', (req, res) => {
  const updates = req.body as UpdateIssue;
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.location !== undefined) { fields.push('location = ?'); values.push(updates.location); }
  if (updates.impact !== undefined) { fields.push('impact = ?'); values.push(updates.impact); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  fields.push("updatedAt = datetime('now')");
  values.push(req.params.id);

  run(`UPDATE issues SET ${fields.join(', ')} WHERE id = ?`, values);

  const issue = queryOne<Issue>('SELECT * FROM issues WHERE id = ?', [req.params.id]);
  res.json(issue);
});

// Delete issue
router.delete('/:id', (req, res) => {
  run('DELETE FROM issues WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

export default router;
