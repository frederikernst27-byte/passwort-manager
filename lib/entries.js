const { decryptText, encryptText } = require('./crypto');
const { query } = require('./db');
const { randomId } = require('./utils');

function mapEntry(row) {
  return {
    id: row.id,
    title: row.title,
    usernameOrEmail: decryptText(row.login_ciphertext),
    password: decryptText(row.password_ciphertext),
    info: decryptText(row.info_ciphertext),
    sharedWith: row.shared_with || [],
    createdAt: row.created_at
  };
}

async function listEntriesForUser(user) {
  const result = user.role === 'admin'
    ? await query(
        `SELECT e.*, COALESCE(array_agg(es.user_id) FILTER (WHERE es.user_id IS NOT NULL), '{}') AS shared_with
         FROM entries e
         LEFT JOIN entry_shares es ON es.entry_id = e.id
         GROUP BY e.id
         ORDER BY e.created_at DESC`
      )
    : await query(
        `SELECT e.*, COALESCE(array_agg(es2.user_id) FILTER (WHERE es2.user_id IS NOT NULL), '{}') AS shared_with
         FROM entries e
         JOIN entry_shares own ON own.entry_id = e.id AND own.user_id = $1
         LEFT JOIN entry_shares es2 ON es2.entry_id = e.id
         GROUP BY e.id
         ORDER BY e.created_at DESC`,
        [user.id]
      );
  return result.rows.map(mapEntry);
}

async function createEntry({ title, usernameOrEmail, password, info, createdBy }) {
  const id = randomId();
  await query(
    `INSERT INTO entries (id, title, login_ciphertext, password_ciphertext, info_ciphertext, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, title, encryptText(usernameOrEmail), encryptText(password), encryptText(info), createdBy]
  );
  return id;
}

async function deleteEntry(id) {
  await query('DELETE FROM entries WHERE id = $1', [id]);
}

async function setEntryShares(entryId, userIds) {
  await query('DELETE FROM entry_shares WHERE entry_id = $1', [entryId]);
  for (const userId of userIds) {
    await query('INSERT INTO entry_shares (entry_id, user_id) VALUES ($1, $2)', [entryId, userId]);
  }
}

module.exports = { listEntriesForUser, createEntry, deleteEntry, setEntryShares };
