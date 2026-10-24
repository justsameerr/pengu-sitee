// Step 1: send the visitor to Discord's login page. A random "state" value protects against forged logins.
const crypto = require('crypto');
const { setCookie } = require('../lib/auth');

exports.handler = async function () {
  const state = crypto.randomBytes(16).toString('hex');
  const client = process.env.DISCORD_CLIENT_ID || '1445398321530146826';
  const redirect = (process.env.SITE_ORIGIN || 'https://pengubot.netlify.app') + '/.netlify/functions/discord-callback';
  const url = 'https://discord.com/oauth2/authorize?' + new URLSearchParams({
    client_id: client, redirect_uri: redirect, response_type: 'code', scope: 'identify', state,
  }).toString();
  return {
    statusCode: 302,
    headers: { Location: url, 'Set-Cookie': setCookie('pengu_state', state, 600), 'Cache-Control': 'no-store' },
    body: '',
  };
};
