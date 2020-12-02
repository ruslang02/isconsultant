## Приложение для проведения юридических консультаций на базе WebRTC

*Нам бы нужно какое-нибудь интересное имя, предлагаю подумать на досуге...*

Возможен запуск в виде Docker-образа. 

Бекенд-часть на базе Nest.JS располагается в папке `/server`, фронтенд-часть на базе React.js - в `/client`. Используемая БД: PostgreSQL ([docker-образ](https://hub.docker.com/_/postgres)).

Быстрый запуск:
```bash
git clone https://git.infostrategic.com/hse/webrtchse1
npm ci
npm run build
npm start
```

## Бекенд

Компиляция в JS:
```
npm run build:server
```

Запуск:
```
npm run start
```