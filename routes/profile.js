const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db/sqlite');

const router = express.Router();

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, phone, email, points, tier, bg_color, created_at, last_login FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const transactions = await db.all('SELECT id, type, points, description, created_at FROM loyalty_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [user.id]);
    res.json({ user, transactions });
  } catch (err) {
    console.error('Profile error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db/sqlite');

const router = express.Router();

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, phone, email, points, tier, bg_color, created_at, last_login FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const transactions = await db.all('SELECT id, type, points, description, created_at FROM loyalty_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [user.id]);
    res.json({ user, transactions });
  } catch (err) {
    console.error('Profile error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;