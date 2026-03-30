const bcrypt = require('bcryptjs');
const { requireAdmin } = require('../lib/auth');
const { query } = require('../lib/db');
const { json, randomId, readJson } = require('../lib/utils');

module.exports = async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    if (req.method === 'GET') {
      const result = await query(
        `SELECT u.id, u.username, u.display_name, u.role, u.created_at,
                COUNT(es.entry_id)::int AS shared_count
         FROM users u
         LEFT JOIN entry_shares es ON es.user_id = u.id
         WHERE u.role = 'customer'
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );
      return json(res, 200, {
        customers: result.rows.map((row) => ({
          id: row.id,
          username: row.username,
          displayName: row.display_name,
          role: row.role,
          createdAt: row.created_at,
          sharedCount: row.shared_count
        }))
      });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const displayName = String(body.displayName || '').trim();
      const username = String(body.username || '').trim();
      const password = String(body.password || '');
      if (!displayName || !username || !password) {
        return json(res, 400, { error: 'Name, Benutzername und Passwort sind erforderlich.' });
      }

      const exists = await query('SELECT 1 FROM users WHERE username = $1 LIMIT 1', [username]);
      if (exists.rows.length) return json(res, 409, { error: 'Benutzername existiert bereits.' });

      const passwordHash = await bcrypt.hash(password, 12);
      const result = await query(
        `INSERT INTO users (id, username, display_name, password_hash, role)
         VALUES ($1, $2, $3, $4, 'customer')
         RETURNING id, username, display_name, role, created_at`,
        [randomId(), username, displayName, passwordHash]
      );

      return json(res, 201, {
        customer: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          displayName: result.rows[0].display_name,
          role: result.rows[0].role,
          createdAt: result.rows[0].created_at,
          sharedCount: 0
        }
      });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Kunden-API Fehler.' });
  }
};
