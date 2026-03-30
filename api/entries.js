const { requireAdmin, requireUser } = require('../lib/auth');
const { createEntry, listEntriesForUser } = require('../lib/entries');
const { json, readJson } = require('../lib/utils');

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const user = await requireUser(req, res);
      if (!user) return;
      const entries = await listEntriesForUser(user);
      return json(res, 200, { entries });
    }

    if (req.method === 'POST') {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      const body = await readJson(req);
      const title = String(body.title || '').trim();
      const usernameOrEmail = String(body.usernameOrEmail || '').trim();
      const password = String(body.password || '');
      const info = String(body.info || '').trim();
      if (!title || !password) {
        return json(res, 400, { error: 'Titel und Passwort sind erforderlich.' });
      }
      const id = await createEntry({ title, usernameOrEmail, password, info, createdBy: admin.id });
      return json(res, 201, { id });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Einträge-API Fehler.' });
  }
};
