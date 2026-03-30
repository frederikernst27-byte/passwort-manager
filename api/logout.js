const { destroySession } = require('../lib/auth');
const { json } = require('../lib/utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    await destroySession(req, res);
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Logoutfehler.' });
  }
};
