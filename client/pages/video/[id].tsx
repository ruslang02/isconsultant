import { useRouter } from "next/router";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, Comment, Icon, Input, InputOnChangeData, Message, Segment } from "semantic-ui-react";
import styles from "./[id].module.css";
import "../../videoroom";

import { JoinChatRoomDto } from "@common/dto/join-chat-room.dto";
import { GetUserInfoDto } from "@common/dto/get-user-info.dto";
import { ReceiveChatMessageDto } from "@common/dto/receive-chat-message.dto";
import { PostChatMessageDto } from "@common/dto/post-chat-message.dto";
import { File as RemoteFile } from "@common/models/file.entity";
import { NewFileNotificationDto } from "@common/dto/new-file-notification.dto";
import { GetEventDto } from "@common/dto/get-event.dto";
import { useTranslation } from "react-i18next";
import VideoContainer from "components/VideoContainer";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";
import { ChatMessage } from "@common/models/chat-message.entity";
import Head from "next/head";

export enum Status {
  NEW = 0,
  STARTED = 1,
  FINISHED = 2,
}

export enum RoomAccess {
  PASSWORD = 0,
  ONLY_PARTICIPANTS = 1
}

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
  const router = useRouter();

  useEffect(() => {
    setRoomId(+location.pathname.split("/")[2]);
  }, []);

  const { t } = useTranslation();

  return (
    <header className={styles.TopYar}>
      <div className={styles.TopYar_info}>
        <div className={styles.TopYar_roomName}>
          {t("pages.video.room_title")} #{roomId}
        </div>
      </div>
      {/*<div className={styles.TopYar_actions}>
        <Button primary>{t('pages.video.room_settings')}</Button>
        <Button color="red" onClick={(e: any) => router.replace("/profile/@me")}>{t('pages.video.leave_call')}</Button>
  </div>*/}
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
  const [auth] = useAuth();
  const { t } = useTranslation();

  return (
    <section className={styles.Files}>
      <b style={{ fontSize: "16px", margin: "9px", display: "inline-block" }}>
        {t("pages.video.files_title")}
      </b>
      <span style={{ position: "relative", float: "right" }}>
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
        <Button primary>
          <Icon name="upload" />
        </Button>
      </span>
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
  count: number;
}

interface WSMessage<T> {
  event: string;
  data: T;
}

const Chat: React.FC = () => {
  const { users, setUsers } = useContext(UserStoreContext);
  const { setFiles } = useContext(FilesContext);
  const [auth] = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [client, setClient] = useState<boolean>(false);
  const messageCount = useRef<number>(0);
  const ws = useRef<WebSocket>(null);

  useEffect(() => {
    console.log("Loading chat...");
    const client = new WebSocket(
      `${location.hostname == "localhost" ? "ws" : "wss"}://${location.hostname
      }${location.port ? ":" + location.port : ""}/chat/${auth?.access_token}`
    );

    // const client = new WebSocket(
    //   `ws://localhost:8081/chat/${auth?.access_token}`
    // );

    ws.current = client;

    client.addEventListener("close", (ev: CloseEvent) => {
      console.log(ev);
    });

    client.addEventListener("error", (ev: Event) => {
      console.log("WS-Error: " + ev);
    });

    client.addEventListener("open", () => {
      client.send(
        JSON.stringify({
          event: "join",
          data: { id: +location.pathname.split("/")[2] },
        } as WSMessage<JoinChatRoomDto>)
      );

      setClient(true);
    });

    client.addEventListener("message", async (ev: MessageEvent<string>) => {
      const { event, data } = JSON.parse(ev.data) as WSMessage<
        ReceiveChatMessageDto & NewFileNotificationDto
      >;
      switch (event) {
        case "message":
          const uid = data.userId.toString();
          let user = users.find((v) => v.id === uid) as GetUserInfoDto;

          if (!user) {
            try {
              const { data } = await api.get<GetUserInfoDto>(`/users/${uid}`);
              user = data;
            } catch (error) {
              user = { first_name: "", last_name: "" } as GetUserInfoDto;
            }
          }

          setMessages((msgs) => {
            const newArray = [
              ...msgs,
              {
                content: data.message,
                user,
                created_at: new Date(),
                count: messageCount.current,
              },
            ];
            messageCount.current++;
            return newArray;
          });
          break;
        case "new_file":
          const { file } = data;
          setFiles((files: RemoteFile[]) => [...files, file]);
          break;
        default:
          console.error(data);
      }
    });

    (async () => {
      const { data } = await api.get<ChatMessage[]>(
        `/events/${+location.pathname.split("/")[2]}/log/json`
      );

      setMessages(
        data.map((_) => ({
          content: _.content,
          count: _.id,
          created_at: new Date(_.created_timestamp),
          user: (_.from as unknown) as GetUserInfoDto,
        }))
      );
    })();

    (async () => {
      const { data } = await api.get<RemoteFile[]>(
        `/events/${+location.pathname.split("/")[2]}/files`
      );
      setFiles(() => data);
    })();

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
      <b style={{ fontSize: "16px", margin: "9px", display: "inline-block" }}>
        {t("pages.video.text_chat_title")}
      </b>
      <div
        style={{
          flexGrow: 1,
          margin: "10px 0",
          overflow: "auto",
          paddingLeft: "10px",
        }}
        ref={commentsRef}
      >
        <Comment.Group>
          {messages.map((message) => (
            <Comment key={message.count}>
              <Comment.Avatar
                src={
                  message.user.avatar ??
                  "https://react.semantic-ui.com/images/avatar/small/matt.jpg"
                }
              />
              <Comment.Content>
                <Comment.Author>
                  <a href={`/profile/${message.user.id}`} target="_blank">
                    {message.user.last_name} {message.user.first_name}
                  </a>
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

      <form
        style={{ display: "flex" }}
        onSubmit={(e) => {
          e.preventDefault();
          ws.current.send(
            JSON.stringify({
              event: "post_message",
              data: {
                message: input,
              },
            } as WSMessage<PostChatMessageDto>)
          );
          setInput("");
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flexGrow: 1, marginRight: ".5rem" }}
          placeholder={t("pages.video.chat_input_placeholder")}
        ></Input>
        <Button icon primary type="submit" disabled={!client}>
          <Icon name="send" />
        </Button>
      </form>
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

const WaitingScreen: React.FC<{
  event: GetEventDto;
  status: Status;
  loaded: boolean;
  error: string;
}> = ({ event, status, loaded, error }) => {
  const router = useRouter();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "400px",
        }}
      >
        {error ? (
          <Message
            warning
            header={error}
            content={
              <>
                <p>You may need to log in to view this meeting.</p>
                <Button
                  onClick={() =>
                    location.assign("/login?redirect=" + location.pathname)
                  }
                  content="Log in"
                  primary
                />
              </>
            }
          />
        ) : !loaded ? (
          <Message header="Loading meeting..." />
        ) : status == Status.NEW ? (
          <Message
            header="Meeting not started"
            content="Wait for organizer to start it"
          />
        ) : (
          <Message
            header="Meeting already finished"
            content="Organizer has already finished this meeting"
          />
        )}
        {loaded && status == Status.NEW && event.room_secret ? (
          <Button
            onClick={(e) => {
              api.post(`events/${event.id}/start`).then((a) => router.reload());
            }}
          >Start meeting</Button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default function Video() {
  const router = useRouter();
  const { id } = router.query;

  const [users, setUsers] = useState<GetUserInfoDto[]>([]);
  const [files, setFiles] = useState<RemoteFile[]>([]);
  const [event, setEvent] = useState<GetEventDto | null>(null);
  const [auth] = useAuth();
  const [status, setStatus] = useState<Status>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState("");

  const inputPin = useRef<string>("");

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      try {
        const { data } = await api.get<GetEventDto>(`/events/${id}`);
        //console.log(data.room_secret)
        setEvent(data);
        setStatus(data.room_status);
        setLoaded(true);
        setError("");
      } catch (e) {
        setError("Event is unavailable.");
      }
    })();
  }, [id]);

  function onPinChange(event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) {
    inputPin.current = data.value
  }

  return (
    <UserStoreContext.Provider value={{ users, setUsers }}>
      <FilesContext.Provider value={{ files, setFiles }}>
        <EventContext.Provider value={event}>
          <Head>
            <title>Ongoing meeting - ISConsultant</title>
          </Head>
          {status != Status.STARTED ? (
            <WaitingScreen
              event={event}
              status={status}
              loaded={loaded}
              error={error}
            />
          ) :
            event.room_access == RoomAccess.PASSWORD && !event.room_password ?
              (<>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    height: "100vh",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      width: "350px",
                    }}
                  >
                    <Segment style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                      <span>
                        Welcome to
                      </span>
                      <h2>ISConsultant</h2>
                      <p style={{alignSelf: "flex-start"}}>
                        You were invited to a meeting <b>{event.title}</b>, hosted by <b>{event.owner.first_name} {event.owner.last_name}</b>.
                      </p>
                      <div style={{alignSelf: "flex-start"}}>
                        In order to join it, enter the meeting password from the invitation:
                      </div>
                      <br />
                      <Input style={{width: "100%"}} placeholder="Meeting password" />
                      <br />
                          <Button
                            onClick={() =>
                              setEvent(e => ({...e, room_password: inputPin.current}))
                            }
                            content="Join meeting"
                            primary
                          />
                    </Segment>
                  </div>
                </div>
              </>) :
              (
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
                    <VideoContainer
                      roomNumber={event.room_id}
                      roomPin={event.room_password}
                      roomSecret={event.room_secret}
                    />

                    <Sidebar />
                  </section>
                </main>
              )}
        </EventContext.Provider>
      </FilesContext.Provider>
    </UserStoreContext.Provider>
  );
}
