const bcrypt = require('bcryptjs');
const { createSession, ensureAdmin, sanitizeUser } = require('../lib/auth');
const { query } = require('../lib/db');
const { json, readJson } = require('../lib/utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    await ensureAdmin();
    const body = await readJson(req);
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (!username || !password) return json(res, 400, { error: 'Benutzername und Passwort sind erforderlich.' });

    const result = await query(
      'SELECT id, username, display_name, password_hash, role, created_at FROM users WHERE username = $1 LIMIT 1',
      [username]
    );
    const user = result.rows[0];
    if (!user) return json(res, 401, { error: 'Login fehlgeschlagen.' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return json(res, 401, { error: 'Login fehlgeschlagen.' });

    await createSession(res, user.id);
    return json(res, 200, { user: sanitizeUser(user) });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Serverfehler beim Login.' });
  }
};
