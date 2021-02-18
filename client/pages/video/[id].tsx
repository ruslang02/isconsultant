import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Button, Icon, Input, Menu } from "semantic-ui-react";
import {io} from "socket.io-client";
import styles from './[id].module.css';
import VideoContainer from "components/VideoContainer"
import VideoMenu from "components/VideoMenu"

//@ts-ignore
import Janus from "janus-gateway-js";
import { send } from "process";
import { create } from "domain";

type VideoStream = {
    user: number,
    stream: any,
    streaming: boolean,
    muted: boolean,
    data: any
}

type Menu = {
    xPos: number,
    yPos: number,
    show: boolean
}

const StreamsContext = createContext([] as VideoStream[])
const StremChangeContext = createContext(null as Function)
const MenuContextProvider = createContext(null as Function)

const TopBar: React.FC = function () {
    const [roomId, setRoomId] = useState(0);

    useEffect(() => {
        setRoomId(+location.pathname.split("/")[2])
    }, [])

    return (
        <header className={styles.TopYar}>
            <div className={styles.TopYar_info}>
                <div className={styles.TopYar_roomName}>
                    Комната #{roomId}
                </div>
            </div>
            <div className={styles.TopYar_actions}>
                <Button primary>
                    Настройки
            </Button>
                <Button color="red">
                    Покинуть звонок
            </Button>
            </div>
        </header>
    )
};

const File: React.FC<{ href: string, icon: string, name: string }> = ({ href, icon, name }) => (
    <div
        style={{
            background: "lightgray",
            border: "1px solid rgba(0, 0, 0, 0.3)",
            marginBottom: ".5rem",
            display: "flex",
            alignItems: "center",
            padding: ".5rem 1rem"
        }}>
        <Icon name={icon as unknown as undefined} size="big" />
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                marginLeft: ".5rem"
            }}>
            <div>
                <b>{name}</b>
            </div>
            <a href={href}>Скачать</a>
        </div>
    </div>
)

const Files: React.FC = () => (
    <section className={styles.Files}>
        <b>Файлы конференции</b>
        <div style={{ flexGrow: 1, marginTop: ".5rem" }}>
            <File icon="image" name="scan4433.jpg" href="#" />
            <File icon="image" name="face.jpg" href="#" />
            <File icon="file" name="passport.pdf" href="#" />
            <File icon="file" name="zayavlenie.docx" href="#" />
        </div>
    </section>
);

const Chat: React.FC = () => {
  useEffect(() => {
    //const client = io('/', {path: '/chat/socket.io', upgrade: true})
  }, [])

  return (
    <section
      style={{
        flexGrow: 1,
        padding: ".5rem",
        display: "flex",
        flexDirection: "column"
      }}>
      <b>Текстовый чат</b>
      <div style={{ flexGrow: 1 }}></div>
      <div style={{ display: "flex" }}>
        <Input
          style={{ flexGrow: 1, marginRight: ".5rem" }}
          placeholder="Ваше сообщение..."></Input>
        <Button icon primary>
          <Icon name="send" />
        </Button>
      </div>
    </section>
  );
};

const Sidebar: React.FC = () => (
    <section
        style={{
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
            background: "white",
            width: "30%",
            minWidth: "350px",
            maxWidth: "450px",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            zIndex: 90
        }}>
        <Files />
        <Chat />
    </section>
);

export default function Video() {
    const router = useRouter();
    const { id } = router.query;

    const [streams, setStreams] = useState<VideoStream[]>([]);
    const [menuState, changeMenuState] = useState<Menu>({xPos: 0, yPos: 0, show: false})

    return (
        <MenuContextProvider.Provider value={changeMenuState}>
        <StremChangeContext.Provider value={setStreams}>
        <StreamsContext.Provider value={streams}>
            <VideoMenu menuState={menuState}></VideoMenu>
            <main
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    overflow: "hidden",
                    flexGrow: 1
                }}>
                <TopBar />
                <section
                    style={{
                        display: "flex",
                        background: "white",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
                        flexGrow: 1
                    }}>
                    <VideoContainer />
                    <Sidebar />
                </section>
            </main>
        </StreamsContext.Provider>
        </StremChangeContext.Provider>
        </MenuContextProvider.Provider>
    );
}
