import { Router } from 'express';
import { query, queryOne, run } from '../db/index.js';
const router = Router();
// Get configs for an issue
router.get('/issue/:issueId', (req, res) => {
    const configs = query('SELECT * FROM configs WHERE issueId = ? ORDER BY createdAt', [req.params.issueId]);
    res.json(configs);
});
// Create config
router.post('/', (req, res) => {
    const { issueId, filePath, content, language, note } = req.body;
    const { lastId } = run('INSERT INTO configs (issueId, filePath, content, language, note) VALUES (?, ?, ?, ?, ?)', [issueId, filePath, content || '', language || 'text', note || null]);
    const config = queryOne('SELECT * FROM configs WHERE id = ?', [lastId]);
    res.status(201).json(config);
});
// Update config
router.put('/:id', (req, res) => {
    const { filePath, content, language, note } = req.body;
    run('UPDATE configs SET filePath = ?, content = ?, language = ?, note = ? WHERE id = ?', [filePath, content || '', language || 'text', note || null, req.params.id]);
    const config = queryOne('SELECT * FROM configs WHERE id = ?', [req.params.id]);
    res.json(config);
});
// Delete config
router.delete('/:id', (req, res) => {
    run('DELETE FROM configs WHERE id = ?', [req.params.id]);
    res.status(204).send();
});
export default router;
