const { getSessionUser } = require('../lib/auth');
const { json } = require('../lib/utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  try {
    const user = await getSessionUser(req);
    return json(res, 200, { user });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Sessionfehler.' });
  }
};
