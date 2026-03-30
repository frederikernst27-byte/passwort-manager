const { requireAdmin } = require('../../lib/auth');
const { deleteEntry } = require('../../lib/entries');
const { json } = require('../../lib/utils');

module.exports = async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'DELETE') return json(res, 405, { error: 'Method not allowed' });

  try {
    await deleteEntry(req.query.id);
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Eintrag konnte nicht gelöscht werden.' });
  }
};
