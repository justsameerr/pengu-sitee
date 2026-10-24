const { clearCookie } = require('../lib/auth');
exports.handler = async function () {
  return { statusCode: 302, multiValueHeaders: { 'Set-Cookie': [clearCookie('pengu_session')] }, headers: { Location: '/', 'Cache-Control': 'no-store' }, body: '' };
};
