const bcrypt = require('bcryptjs');
const { query } = require('./db');
const { clearCookie, json, parseCookies, randomId, setCookie, sha256 } = require('./utils');

const SESSION_COOKIE = 'vaultdesk_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

async function ensureAdmin() {
  const result = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (result.rows.length) return;

  const username = (process.env.ADMIN_USERNAME || '').trim();
  const password = process.env.ADMIN_PASSWORD || '';
  const displayName = (process.env.ADMIN_DISPLAY_NAME || 'Admin').trim() || 'Admin';

  if (!username || !password) {
    throw new Error('Admin user missing. Set ADMIN_USERNAME and ADMIN_PASSWORD.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await query(
    'INSERT INTO users (id, username, display_name, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
    [randomId(), username, displayName, passwordHash, 'admin']
  );
}

function sanitizeUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    createdAt: row.created_at
  };
}

async function createSession(res, userId) {
  const sessionId = randomId();
  const token = randomId() + randomId();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await query(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
    [sessionId, userId, tokenHash, expiresAt]
  );
  setCookie(res, SESSION_COOKIE, token, { maxAge: SESSION_TTL_SECONDS });
}

async function destroySession(req, res) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (token) {
    await query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)]);
  }
  clearCookie(res, SESSION_COOKIE);
}

async function getSessionUser(req) {
  await ensureAdmin();
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const result = await query(
    `SELECT s.id AS session_id, u.id, u.username, u.display_name, u.role, u.created_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()
     LIMIT 1`,
    [sha256(token)]
  );

  return result.rows[0] ? sanitizeUser(result.rows[0]) : null;
}

async function requireUser(req, res) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      json(res, 401, { error: 'Nicht angemeldet.' });
      return null;
    }
    return user;
  } catch (error) {
    json(res, 500, { error: error.message || 'Auth-Fehler.' });
    return null;
  }
}

async function requireAdmin(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    json(res, 403, { error: 'Nur Admin erlaubt.' });
    return null;
  }
  return user;
}

module.exports = {
  SESSION_COOKIE,
  ensureAdmin,
  sanitizeUser,
  createSession,
  destroySession,
  getSessionUser,
  requireUser,
  requireAdmin
};
