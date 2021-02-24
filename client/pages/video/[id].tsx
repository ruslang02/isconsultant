import { useRouter } from "next/router";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, Comment, Icon, Input } from "semantic-ui-react";
import styles from "./[id].module.css";
import "../../videoroom";

import { JoinChatRoomDto } from "@common/dto/join-chat-room.dto";
import { AuthContext } from "utils/AuthContext";
import { GetUserInfoDto } from "@common/dto/get-user-info.dto";
import { ReceiveChatMessageDto } from "@common/dto/receive-chat-message.dto";
import { PostChatMessageDto } from "@common/dto/post-chat-message.dto";
import { File as RemoteFile } from "@common/models/file.entity";
import { NewFileNotificationDto } from "@common/dto/new-file-notification.dto";
import { GetEventDto } from "@common/dto/get-event.dto";
import { useTranslation } from "react-i18next";
import VideoContainer from "components/VideoContainer";
import { api } from "utils/api";

const UserStoreContext = createContext<{
  users: GetUserInfoDto[];
  setUsers: (users: GetUserInfoDto[]) => void;
}>({ users: [], setUsers: () => { } });
const FilesContext = createContext<{
  files: RemoteFile[];
  setFiles: (reducer: (prevFiles: RemoteFile[]) => RemoteFile[]) => void;
}>({ files: [], setFiles: () => () => { } });
const EventContext = createContext<GetEventDto | null>(null);

const TopBar: React.FC = function () {
  const [roomId, setRoomId] = useState(0);

  useEffect(() => {
    setRoomId(+location.pathname.split("/")[2]);
  }, []);

  const { t } = useTranslation();

  return (
    <header className={styles.TopYar}>
      <div className={styles.TopYar_info}>
        <div className={styles.TopYar_roomName}>{t('pages.video.room_title')} #{roomId}</div>
      </div>
      <div className={styles.TopYar_actions}>
        <Button primary>{t('pages.video.room_settings')}</Button>
        <Button color="red">{t('pages.video.leave_call')}</Button>
      </div>
    </header>
  );
};

const File: React.FC<{ href: string; icon: string; name: string }> = ({
  href,
  icon,
  name,
}) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        background: "lightgray",
        border: "1px solid rgba(0, 0, 0, 0.3)",
        marginBottom: ".5rem",
        display: "flex",
        alignItems: "center",
        padding: ".5rem 1rem",
      }}
    >
      <Icon name={(icon as unknown) as undefined} size="big" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginLeft: ".5rem",
        }}
      >
        <div>
          <b>{name}</b>
        </div>
        <a href={href} target="_blank">
          {t("pages.video.download_file")}
        </a>
      </div>
    </div>
  );
};

const Files: React.FC = () => {
  const { files, setFiles } = useContext(FilesContext);
  const event = useContext(EventContext);
  const { auth } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <section className={styles.Files}>
      <b>{t("pages.video.files_title")}</b>
      <div style={{ position: "relative" }}>
        <input
          type="file"
          name="file"
          onChange={(e) => {
            if (!e.target.files) return;

            const formData = new FormData();
            formData.set("file", e.target.files[0]);
            api.post(
              `/events/${event?.id}/files?name=${e.target.files[0].name}`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${auth?.access_token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            opacity: 0,
          }}
        />
        <Button primary>{t('pages.video.upload_file')}</Button>
      </div>
      <div style={{ flexGrow: 1, marginTop: ".5rem" }}>
        {files.map((file) => (
          <File
            icon="file"
            name={file.name}
            href={`/api/events/${event?.id}/files/${file.id}/${file.name}`}
          />
        ))}
      </div>
    </section>
  );
};

interface Message {
  content: string;
  user: GetUserInfoDto;
  created_at: Date;
}

interface WSMessage<T> {
  event: string;
  data: T;
}

const Chat: React.FC = () => {
  const { users, setUsers } = useContext(UserStoreContext);
  const { setFiles } = useContext(FilesContext);
  const { auth } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [client, setClient] = useState<WebSocket | null>(null);

  useEffect(() => {
    console.log("Loading chat...");
    const client = new WebSocket(
      `${location.hostname == "localhost" ? "ws" : "wss"}://${location.hostname}${
        location.port ? ":" + location.port : ""
      }/chat/${auth?.access_token}`
    );

    client.addEventListener("error", (ev: Event) =>{
      console.log("WS-Error: " + ev)
    })

    client.addEventListener("open", () => {
      client.send(
        JSON.stringify({
          event: "join",
          data: { id: +location.pathname.split("/")[2] },
        } as WSMessage<JoinChatRoomDto>)
      );
      setClient(client);
    });

    client.addEventListener("message", async (ev: MessageEvent<string>) => {
      const { event, data } = JSON.parse(ev.data) as WSMessage<
        ReceiveChatMessageDto & NewFileNotificationDto
      >;
      switch (event) {
        case "message":
          const uid = +data.userId;
          let user = users.find((v) => v.id === uid) as GetUserInfoDto;

          if (!user) {
            const { data } = await api.get<GetUserInfoDto>(`/users/${uid}`);
            user = data;
          }

          setMessages((msgs) => [
            ...msgs,
            {
              content: data.message,
              user,
              created_at: new Date(),
            },
          ]);
          break;
        case "new_file":
          const { file } = data;
          setFiles((files: RemoteFile[]) => ([...files, file]));
          break;
        default:
          console.error(data);
      }
    });

    setClient(client);

    return () => {
      client.close();
    };
  }, [auth]);

  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [messages]);

  const { t } = useTranslation();

  return (
    <section
      style={{
        padding: ".5rem",
        display: "flex",
        flexDirection: "column",
        height: "300px",
      }}
    >
      <b>{t("pages.video.text_chat_title")}</b>
      <div
        style={{ flexGrow: 1, margin: "10px 0", overflow: "auto" }}
        ref={commentsRef}
      >
        <Comment.Group>
          {messages.map((message) => (
            <Comment key={message.user.id}>
              <Comment.Avatar
                src={
                  message.user.avatar ??
                  "https://react.semantic-ui.com/images/avatar/small/matt.jpg"
                }
              />
              <Comment.Content>
                <Comment.Author as="a">
                  {message.user.last_name} {message.user.first_name}
                </Comment.Author>
                <Comment.Metadata>
                  <div>{message.created_at.toLocaleTimeString()}</div>
                </Comment.Metadata>
                <Comment.Text>{message.content}</Comment.Text>
              </Comment.Content>
            </Comment>
          ))}
        </Comment.Group>
      </div>

      <div style={{ display: "flex" }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flexGrow: 1, marginRight: ".5rem" }}
          placeholder={t("pages.video.chat_input_placeholder")}
        ></Input>
        <Button
          icon
          primary
          disabled={!!client && client.readyState !== WebSocket.OPEN}
          onClick={() => {
            client?.send(
              JSON.stringify({
                event: "post_message",
                data: {
                  message: input,
                },
              } as WSMessage<PostChatMessageDto>)
            );
          }}
        >
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
      zIndex: 90,
    }}
  >
    <Files />
    <Chat />
  </section>
);

export default function Video() {
  const router = useRouter();
  const { id } = router.query;
  const pin = router.query["pin"]
  const secret = router.query["secret"]

  const [users, setUsers] = useState<GetUserInfoDto[]>([]);
  const [files, setFiles] = useState<RemoteFile[]>([]);
  const [event, setEvent] = useState<GetEventDto | null>(null);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (!id)
      return

    (async () => {
      try {
        const { data } = await api.get<GetEventDto>(`/events/${id}`, {
          headers: {
            Authorization: `Bearer ${auth?.access_token}`,
          },
        });
        setEvent(data);
      } catch (e) { }
    });
  }, [id]);

  return (
    <UserStoreContext.Provider value={{ users, setUsers }}>
      <FilesContext.Provider value={{ files, setFiles }}>
        <EventContext.Provider value={event}>
          <main
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
              flexGrow: 1,
            }}
          >
            <TopBar />
            <section
              style={{
                display: "flex",
                background: "white",
                borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
                flexGrow: 1,
              }}
            >
              {!("id" in router.query) ? <></> :
                <VideoContainer roomNumber={id} roomPin={pin} roomSecret={secret} />
              }
              <Sidebar />
            </section>
          </main>
        </EventContext.Provider>
      </FilesContext.Provider>
    </UserStoreContext.Provider>
  );
}
