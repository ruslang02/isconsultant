Для запуска серверной части Janus:
- Указать в docker-compose.yml путь к файлу конфигурации janus.jcfg в разделе volumes:

"path_to_janus.jcfg:/usr/local/etc/janus/janus.jcfg"

- Открыть порт 8088 TCP/UDP для доступа к серверу по протоколу HTTP
- docker-compose up
