// Step 2: Discord sends the visitor back here with a code. We check the state, swap the code for a token,
// read the visitor's public name and avatar, and store them in a signed session cookie.
const { cookies, sign, setCookie, clearCookie } = require('../lib/auth');

exports.handler = async function (event) {
  const q = event.queryStringParameters || {};
  const jar = cookies(event.headers && event.headers.cookie);
  const fail = () => ({
    statusCode: 302,
    multiValueHeaders: { 'Set-Cookie': [clearCookie('pengu_state')] },
    headers: { Location: '/?login=failed', 'Cache-Control': 'no-store' },
    body: '',
  });
  if (q.error || !q.code || !q.state || !jar.pengu_state || q.state !== jar.pengu_state) return fail();

  const secret = process.env.DISCORD_CLIENT_SECRET;
  if (!secret) return fail();
  const client = process.env.DISCORD_CLIENT_ID || '1445398321530146826';
  const redirect = (process.env.SITE_ORIGIN || 'https://pengubot.netlify.app') + '/.netlify/functions/discord-callback';

  const tok = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: client, client_secret: secret, grant_type: 'authorization_code', code: q.code, redirect_uri: redirect }),
  }).catch(() => null);
  if (!tok || !tok.ok) return fail();
  const t = await tok.json();

  const me = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: 'Bearer ' + t.access_token } }).catch(() => null);
  if (!me || !me.ok) return fail();
  const u = await me.json();

  const session = sign({
    id: u.id,
    name: u.global_name || u.username,
    avatar: u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128` : '',
    exp: Date.now() + 7 * 86400e3,
  });
  return {
    statusCode: 302,
    multiValueHeaders: { 'Set-Cookie': [setCookie('pengu_session', session, 7 * 86400), clearCookie('pengu_state')] },
    headers: { Location: '/', 'Cache-Control': 'no-store' },
    body: '',
  };
};
