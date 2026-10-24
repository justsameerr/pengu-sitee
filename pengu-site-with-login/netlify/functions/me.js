// Returns the signed-in visitor's public name and avatar, or {user: null}. Never returns the token.
const { cookies, verify } = require('../lib/auth');

exports.handler = async function (event) {
  const s = verify(cookies(event.headers && event.headers.cookie).pengu_session);
  const json = (code, body) => ({ statusCode: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
  if (!s) return json(401, { user: null });
  return json(200, { user: { id: s.id, name: s.name, avatar: s.avatar } });
};
