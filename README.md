## ISConsultant - приложение для проведения юридических консультаций на базе WebRTC

Возможен запуск в виде Docker-образа.

Бекенд-часть на базе Nest.js располагается в папке `/server`, клиентская часть на базе [Next.js](https://nextjs.org) - в `/client`. Используемая БД: PostgreSQL, Redis.

Быстрый запуск:

```bash
git clone https://git.infostrategic.com/hse/webrtchse1
docker-compose -f docker-compose.json up
```

## Структура проекта

```
project/
├── client/                Клиентский веб-сайт (веб-фронтенд на Next.js)
├── common/                Общие компоненты серверной и клиентской части
│   ├── dto/               Описания форматов DTO (Data Transfer Object)
│   ├── locales/           Файлы локализаций (русский, английский)
│   ├── models/            Описания моделей в базе данных
│   └── utils/             Дополнительные типы, утилиты
├── janus/                 Конфигурация видео-сервера
├── proxy/                 Конфигурация обратного прокси-сервера
├── server/                Серверная часть проекта (бекенд на Nest.js)
├── development.env        Конфигурационный файл для разработки
├── docker-compose.json    Файл развертывания Docker-сервера (база данных, бекенд)
├── Dockerfile             Файл компиляции Docker-контейнера
├── production.env         Конфигурационный файл для развертки на реальный сервер
└── README.md              Файл краткого описания проекта
```

## Конфигурация

Конфигурационные переменные проекты предлагается хранить в файлах `development.env` и `production.env` для запуска соответственно среды для разработки и массового распространения.

|          Переменная | Функция                                            | Значение по умолчанию                         |
| ------------------: | -------------------------------------------------- | --------------------------------------------- |
|        `JWT_SECRET` | Секретный ключ для подписания JSON Web Token       | от 32 символов                                |
|     `POSTGRES_HOST` | Адрес размещения базы данных PostgreSQL            | `127.0.0.1`                                   |
|     `POSTGRES_PORT` | Порт размещения базы данных PostgreSQL             | `5432`                                        |
|     `POSTGRES_USER` | Пользователь-администратор СУБД PostgreSQL         | `wrtcu`                                       |
| `POSTGRES_PASSWORD` | Пароль пользователя-администратора СУБД PostgreSQL | `wrtcp`                                       |
|       `POSTGRES_DB` | Имя базы данных, с которой работает приложение     | `webrtc`                                      |
|              `PORT` | Порт, через который доступен сервер                | `8080`                                        |
|         `CHAT_PORT` | Порт WebSocket-сервера чата                        | `8081`                                        |
|  `STORAGE_LOCATION` | Директория на локальном диске для хранения файлов  | `/tmp/isc`                                    |
|       `DEVELOPMENT` | Флаг о текущей среде выполнения                    | `false`                                       |
|             `JANUS` | URL инстанса Janus Gateway                         | `wss://consultant.infostrategic.com/gateway2` |
|             `REDIS` | URL базы данных Redis                              | `redis://redis`                               |
