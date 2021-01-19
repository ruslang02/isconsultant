import { useRouter } from "next/router";
import React from "react";
import { Button, Icon, Input } from "semantic-ui-react";

const Spacer: React.FC = () => (
    <div style={{ flexGrow: 1, overflow: "hidden" }}></div>
);

const TopBar: React.FC = () => (
    <header
        style={{
            display: "flex",
            background: "white",
            borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
            height: "55px"
        }}>
        <Spacer />
        <div
            style={{
                width: "30%",
                minWidth: "350px",
                maxWidth: "450px",
                display: "flex",
                padding: ".5rem",
                justifyContent: "stretch",
                borderLeft: "1px solid rgba(0,0,0,0.3)"
            }}>
            <Button primary style={{ flexGrow: 1, marginRight: ".5rem" }}>
                Настройки
            </Button>
            <Button color="red" style={{ flexGrow: 1 }}>
                Покинуть звонок
            </Button>
        </div>
    </header>
);

const VideoItem: React.FC<{ name: string }> = ({ name }) => (
    <div
        style={{
            width: "320px",
            height: "180px",
            borderRadius: "10px",
            background: "black",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            margin: "1rem"
        }}>
        <div
            style={{
                fontWeight: "bold",
                textAlign: "center",
                fontSize: "13pt"
            }}>
            {name}
        </div>
    </div>
);

const VideoContainer: React.FC = () => (
    <section
        style={{
            background: "linear-gradient(white, lightblue)",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column"
        }}>
        <div style={{ flexGrow: 1 }}></div>
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                margin: "1rem",
                justifyContent: "center"
            }}>
            <VideoItem name="Ruslan Garifullin" />
            <VideoItem name="Ruslan Garifullin" />
            <VideoItem name="Ruslan Garifullin" />
            <VideoItem name="Ruslan Garifullin" />
            <VideoItem name="Ruslan Garifullin" />
        </div>
        <div style={{ flexGrow: 1 }}></div>
        <Actions />
    </section>
);

const Actions: React.FC = () => (
    <div
        style={{
            position: "sticky",
            bottom: 0,
            width: "100%",
            padding: "1.5rem",
            display: "flex",
            justifyContent: "center"
        }}>
        <Button
            icon
            secondary
            circular
            style={{
                width: "64px",
                height: "64px",
                marginRight: "1rem"
            }}>
            <Icon style={{ width: "26px" }} name="tv" size="large"></Icon>
        </Button>
        <Button
            icon
            secondary
            circular
            style={{
                width: "64px",
                height: "64px",
                marginRight: "1rem"
            }}>
            <Icon
                style={{ width: "26px" }}
                name="microphone slash"
                size="large"></Icon>
        </Button>
        <Button
            icon
            color="red"
            circular
            style={{ width: "64px", height: "64px" }}>
            <Icon
                style={{ width: "26px" }}
                name="phone volume"
                size="large"></Icon>
        </Button>
    </div>
);

const File: React.FC < { href: string, icon: string, name: string } > = ({ href, icon, name }) => (
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
  <section
    style={{
      borderBottom: "1px solid rgba(0,0,0,0.3)",
      flexGrow: 1,
      padding: ".5rem",
      overflow: "auto"
    }}>
    <b>Файлы конференции</b>
    <div style={{ flexGrow: 1, marginTop: ".5rem" }}>
      <File icon="image" name="scan4433.jpg" href="#" />
      <File icon="image" name="face.jpg" href="#" />
      <File icon="file" name="passport.pdf" href="#" />
      <File icon="file" name="zayavlenie.docx" href="#" />
    </div>
  </section>
);

const Chat: React.FC = () => (
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

const Sidebar: React.FC = () => (
    <section
        style={{
            borderLeft: "1px solid rgba(0,0,0,0.8)",
            background: "white",
            width: "30%",
            minWidth: "350px",
            maxWidth: "450px",
            display: "flex",
            flexDirection: "column"
        }}>
    <Files />
    <Chat />
    </section>
);

export default function Video() {
    const router = useRouter();
    const { id } = router.query;

    return (
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
    );
}
