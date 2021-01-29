const redbird = require('redbird');

const DEBUG = process.env.DEBUG === 'true';

const proxy = redbird({ port: DEBUG ? 9090 : 80, xfwd: false });

proxy.register('localhost', 'http://localhost:' + process.env.WEB_PORT);
proxy.register('localhost/api', 'http://localhost:' + process.env.PORT);
proxy.register('localhost/chat', 'http://localhost:' + process.env.CHAT_PORT);

if (DEBUG) {
  proxy.register('localhost/gateway', 'https://consultant.infostrategic.com/gateway');
  proxy.register('localhost/gateway2', 'https://consultant.infostrategic.com/gateway2');
}