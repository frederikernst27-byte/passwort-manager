const { requireAdmin } = require('../../../lib/auth');
const { query } = require('../../../lib/db');
const { setEntryShares } = require('../../../lib/entries');
const { json, readJson } = require('../../../lib/utils');

module.exports = async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    const entryId = req.query.id;
    const body = await readJson(req);
    const userIds = Array.isArray(body.userIds) ? [...new Set(body.userIds.map(String))] : [];

    const entry = await query('SELECT id FROM entries WHERE id = $1 LIMIT 1', [entryId]);
    if (!entry.rows.length) return json(res, 404, { error: 'Eintrag nicht gefunden.' });

    if (userIds.length) {
      const users = await query(
        "SELECT id FROM users WHERE role = 'customer' AND id = ANY($1::text[])",
        [userIds]
      );
      if (users.rows.length !== userIds.length) {
        return json(res, 400, { error: 'Mindestens ein Kunde ist ungültig.' });
      }
    }

    await setEntryShares(entryId, userIds);
    return json(res, 200, { ok: true, sharedWith: userIds });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Freigaben konnten nicht gespeichert werden.' });
  }
};
