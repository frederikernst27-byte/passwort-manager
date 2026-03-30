const { requireAdmin } = require('../../lib/auth');
const { query } = require('../../lib/db');
const { json } = require('../../lib/utils');

module.exports = async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'DELETE') return json(res, 405, { error: 'Method not allowed' });

  try {
    const id = req.query.id;
    const result = await query("DELETE FROM users WHERE id = $1 AND role = 'customer' RETURNING id", [id]);
    if (!result.rows.length) return json(res, 404, { error: 'Kunde nicht gefunden.' });
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Kunde konnte nicht gelöscht werden.' });
  }
};
