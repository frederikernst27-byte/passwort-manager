const crypto = require('crypto');

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const idx = part.indexOf('=');
        return [part.slice(0, idx), decodeURIComponent(part.slice(idx + 1))];
      })
  );
}

function setCookie(res, name, value, options = {}) {
  const pieces = [`${name}=${encodeURIComponent(value)}`];
  if (options.httpOnly !== false) pieces.push('HttpOnly');
  if (options.secure !== false) pieces.push('Secure');
  pieces.push(`SameSite=${options.sameSite || 'Lax'}`);
  pieces.push(`Path=${options.path || '/'}`);
  if (options.maxAge !== undefined) pieces.push(`Max-Age=${options.maxAge}`);
  if (options.expires) pieces.push(`Expires=${options.expires.toUTCString()}`);
  const existing = res.getHeader('Set-Cookie');
  const next = existing ? [].concat(existing, pieces.join('; ')) : pieces.join('; ');
  res.setHeader('Set-Cookie', next);
}

function clearCookie(res, name) {
  setCookie(res, name, '', { maxAge: 0, expires: new Date(0) });
}

function randomId() {
  return crypto.randomUUID();
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = { json, readJson, parseCookies, setCookie, clearCookie, randomId, sha256 };
