const redbird = require('redbird');

const DEBUG = process.env.DEBUG === 'true';

const proxy = redbird({ port: DEBUG ? 9090 : 80, xfwd: false });

proxy.register('localhost', 'http://localhost:' + 8090);
proxy.register('localhost/api', 'http://localhost:' + 8080 + '/api');
proxy.register('localhost/admin', 'http://localhost:' + 8080 + '/admin');
proxy.register('localhost/docs', 'http://localhost:' + 8080 + '/docs');
proxy.register('localhost/chat', 'http://localhost:' + 8081);

if (DEBUG) {
  proxy.register('localhost/gateway', 'https://consultant.infostrategic.com/gateway');
  proxy.register('localhost/gateway2', 'https://consultant.infostrategic.com/gateway2');
}