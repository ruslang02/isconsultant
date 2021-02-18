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
import "./videoroom";
import axios from "axios";

//@ts-ignore
import Janus from "janus-gateway-js";
import { JoinChatRoomDto } from "@common/dto/join-chat-room.dto";
import { AuthContext } from "utils/AuthContext";
import { GetUserInfoDto } from "@common/dto/get-user-info.dto";
import { ReceiveChatMessageDto } from "@common/dto/receive-chat-message.dto";
import { User } from "@common/models/user.entity";
import { PostChatMessageDto } from "@common/dto/post-chat-message.dto";
import { join } from "path";
import { url } from "inspector";
import { File as RemoteFile } from "@common/models/file.entity";
import { NewFileNotificationDto } from "@common/dto/new-file-notification.dto";
import { GetEventDto } from "@common/dto/get-event.dto";

var roomSession: any = undefined;
var publisherHandle: any = undefined;
var participants: any = undefined;
var isPublishing: boolean = false;
var janus: any = undefined;
var connectionHandle: any = undefined;
var subscriberHandles: any[] = [];
var running: boolean = false;
var muted = false;
var video = true;
var dataChannel: any = null;

type VideoStream = {
  user: number;
  stream: any;
  streaming: boolean;
  muted: boolean;
  data: any;
};

const api = axios.create({
  baseURL: "/api",
});
const StreamsContext = createContext<VideoStream[]>([]);
const StremChangeContext = createContext<Function>((arr: VideoStream[]) => {});
const UserStoreContext = createContext<{
  users: GetUserInfoDto[];
  setUsers: (users: GetUserInfoDto[]) => void;
}>({ users: [], setUsers: () => {} });
const FilesContext = createContext<{
  files: RemoteFile[];
  setFiles: (files: RemoteFile[]) => void;
}>({ files: [], setFiles: () => {} });
const EventContext = createContext<GetEventDto | null>(null);

const TopBar: React.FC = function () {
  const [roomId, setRoomId] = useState(0);

  useEffect(() => {
    setRoomId(+location.pathname.split("/")[2]);
  }, []);

  return (
    <header className={styles.TopYar}>
      <div className={styles.TopYar_info}>
        <div className={styles.TopYar_roomName}>Комната #{roomId}</div>
      </div>
      <div className={styles.TopYar_actions}>
        <Button primary>Настройки</Button>
        <Button color="red">Покинуть звонок</Button>
      </div>
    </header>
  );
};

const VideoItem: React.FC<{ videoStream: VideoStream }> = function ({
  videoStream,
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.muted = videoStream.user == -1 || videoStream.muted;
      ref.current.autoplay = true;
      ref.current.srcObject = videoStream.stream;
    }
  }, []);

  return (
    <div className={styles.Video_item}>
      <video
        className={styles.Video_item_element}
        ref={ref}
        hidden={!videoStream.streaming}
      />
      <div className={styles.Video_item_name} hidden={videoStream.streaming}>
        {videoStream.user}
      </div>
    </div>
  );
};

const VideoContainer: React.FC = function () {
  const streams = useContext(StreamsContext);

  return (
    <section className={styles.Video_container}>
      <div style={{ flexGrow: 1 }}></div>
      <div className={styles.Video_container_items}>
        {streams.map((e) => (
          <VideoItem key={e.user} videoStream={e} />
        ))}
      </div>
      <div style={{ flexGrow: 1 }}></div>
      <Actions />
    </section>
  );
};

const Actions: React.FC = function () {
  const streams = useContext(StreamsContext);
  const setStreams = useContext(StremChangeContext);

  const [mutedIcon, setMutedIcon] = useState(Boolean);
  const [videoIcon, setVideoIcon] = useState(Boolean);

  function sendData() {
    var localStream = streams.find((a) => a.user == -1);
    localStream?.data.send(JSON.stringify({ muted: muted, streaming: video }));
    console.log(localStream?.data);
  }

  function onMuteClick() {
    muted = !muted;
    var localStream = streams.find((a) => a.user == -1);

    if (localStream) {
      localStream.stream.getAudioTracks()[0].enabled = !muted;
      setMutedIcon(() => muted);
      sendData();
      setStreams((h: VideoStream[]) => {
        var i = h.findIndex((a) => a.user == -1);
        var k = h.find((a) => a.user == -1);
        if (k) {
          k.muted = muted;
          var newH = [...h];
          newH.splice(i, 1);
          return [...newH, k];
        }
      });
    }
  }

  function onVideoClick() {
    video = !video;
    var localStream = streams.find((a) => a.user == -1);
    if (localStream) {
      localStream.stream.getVideoTracks()[0].enabled = video;
      setVideoIcon((a) => video);
      sendData();
      setStreams((h: VideoStream[]) => {
        var i = h.findIndex((a) => a.user == -1);
        var k = h.find((a) => a.user == -1);
        if (k) {
          k.streaming = video;
          var newH = [...h];
          newH.splice(i, 1);
          return [...newH, k];
        }
      });
    }
  }

  return (
    <div className={styles.Actions}>
      <Button
        icon
        secondary
        circular
        style={{
          width: "64px",
          height: "64px",
          marginRight: "1rem",
        }}
      >
        <Icon style={{ width: "26px" }} name="tv" size="large"></Icon>
      </Button>
      <Button
        onClick={onVideoClick}
        icon
        primary
        circular
        style={{
          width: "64px",
          height: "64px",
          marginRight: "1rem",
        }}
      >
        <Icon
          style={{ width: "26px" }}
          name={videoIcon ? "video camera" : "video play"}
          size="large"
        ></Icon>
      </Button>
      <Button
        onClick={onMuteClick}
        icon
        secondary
        circular
        style={{
          width: "64px",
          height: "64px",
          marginRight: "1rem",
        }}
      >
        <Icon
          style={{ width: "26px" }}
          name={mutedIcon ? "microphone slash" : "microphone"}
          size="large"
        ></Icon>
      </Button>
    </div>
  );
};

const File: React.FC<{ href: string; icon: string; name: string }> = ({
  href,
  icon,
  name,
}) => (
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
      <a href={href} target="_blank">Скачать</a>
    </div>
  </div>
);

const Files: React.FC = () => {
  const { files, setFiles } = useContext(FilesContext);
  const event = useContext(EventContext);
  const { auth } = useContext(AuthContext);

  return (
    <section className={styles.Files}>
      <b>Файлы конференции</b>
      <div style={{ position: "relative" }}>
        <input
          type="file"
          name="file"
          onChange={(e) => {
            if (!e.target.files) return;

            const formData = new FormData();
            formData.set("file", e.target.files[0]);
            api.post(`/events/${event?.id}/files?name=${e.target.files[0].name}`, formData, {
              headers: {
                Authorization: `Bearer ${auth?.access_token}`,
                'Content-Type': 'multipart/form-data'
              },
            });
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
        <Button primary>Upload a file</Button>
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
  const { files, setFiles } = useContext(FilesContext);
  const { auth } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [client, setClient] = useState<WebSocket | null>(null);

  useEffect(() => {
    console.log("Loading chat...");
    const client = new WebSocket(
      `ws://${location.hostname}${
        location.port ? ":" + location.port : ""
      }/chat/${auth?.access_token}`
    );
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
          setFiles([...files, file]);
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

  return (
    <section
      style={{
        padding: ".5rem",
        display: "flex",
        flexDirection: "column",
        height: "300px",
      }}
    >
      <b>Текстовый чат</b>
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
          placeholder="Ваше сообщение..."
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

// janus = new Janus.Client('ws://localhost:8188', {
//     token: '',
//     apisecret: '',
//     keepalive: 'true'
// });

janus = new Janus.Client("wss://consultant.infostrategic.com/gateway2", {
  token: "",
  apisecret: "",
  keepalive: "true",
});

export default function Video() {
  const router = useRouter();
  const { id } = router.query;

  const [streams, setStreams] = useState<VideoStream[]>([]);

  useEffect(() => {
    const addToStreams = (stream: VideoStream) => {
      // Похоже, чтобы видеть streams, нужно все действия с ними проворачивать
      // из setStreams
      // @ruslang

      // if (!streams.find((a) => a.user === stream.user)) {
      //     setStreams(streams => (
      //         [...streams, stream]
      //     ));
      // } else {
      //     console.warn("Was trying to add the same user.");
      // }

      setStreams(function (previousStreams) {
        if (!previousStreams.find((a) => a.user === stream.user)) {
          return [...previousStreams, stream];
        } else {
          console.warn("Was trying to add the same user.");
        }

        return previousStreams;
      });
    };

    const removeFromStreams = (id: number) => {
      // Похоже, чтобы видеть streams, нужно все действия с ними проворачивать
      // из setStreams
      // @ruslang

      // const index = streams.findIndex((a) => a.user === id);
      // if (index === -1) {
      //     return;
      // }
      // const newStreams = [...streams]
      // newStreams.splice(index, 1);
      // setStreams(newStreams);

      setStreams(function (previousStreams) {
        const index = previousStreams.findIndex((a) => a.user === id);
        if (index === -1) {
          return previousStreams;
        }

        const newStreams = [...previousStreams];
        newStreams.splice(index, 1);
        return newStreams;
      });
    };

    console.log("mounted");
    function processPublisher(publisher: any) {
      roomSession
        .attachPlugin("janus.plugin.videoroom")
        .then(function (plugin: any) {
          function onRoomAsSubJoin(response: any) {
            //console.log(response);

            if (response.getPluginData()["videoroom"] == "attached") {
              var jsep = response.get("jsep");
              if (jsep) {
                var pc: any = plugin.createPeerConnection();
                pc.onaddstream = function (obj: any) {
                  const { stream } = obj;
                  addToStreams({
                    stream,
                    streaming: true,
                    user: publisher["id"],
                    muted: false,
                    data: undefined,
                  });
                };

                pc.ondatachannel = function (obj: any) {
                  //console.log(obj)
                  setStreams((a) => {
                    var s = a.find((e) => e.user == publisher["id"]);

                    obj.channel.onmessage = (event: any) => {
                      console.log(event);
                      var data = JSON.parse(event["data"]);
                      setStreams((b) => {
                        var i = b.findIndex((e) => e.user == publisher["id"]);
                        var d = b.find((e) => e.user == publisher["id"]);
                        var newB = [...b];
                        if (d) {
                          newB.splice(i, 1);
                          d.muted = data["muted"];
                          d.streaming = data["streaming"];
                          console.log(d);
                          console.log(b);
                          return [...newB, d];
                        }
                        return [...newB];
                      });
                    };

                    if (s) s.data = obj.channel;
                    return a;
                  });
                };

                dataChannel = pc.createDataChannel("events");

                plugin.createAnswer(jsep).then(function (jsep: any) {
                  plugin
                    .sendWithTransaction({
                      jsep: jsep,
                      body: { request: "start" },
                    })
                    .then(function (response: any) {
                      if (response.getPluginData()["started"] == "ok") {
                        //console.log("Success")
                      }
                    });
                });
              }
            }
          }

          subscriberHandles.push(plugin);
          plugin
            .sendWithTransaction({
              body: {
                request: "join",
                room: 1234,
                ptype: "subscriber",
                feed: publisher["id"],
                data: true,
              },
            })
            .then(onRoomAsSubJoin);
          //plugin.on('message', onMessage);
          //plugin.detach();
        })
        .catch(console.warn.bind(console));
    }

    function onMessage(message: any) {
      var data = message.getPluginData();
      if (data == null) {
        return;
      }

      //console.log(data);

      // if (data["videoroom"] == "joined") {
      //     participants = data["publishers"]
      //     participants.forEach((element: any) => {
      //         processPublisher(element);
      //     });
      // }

      if (data["videoroom"] == "event") {
        participants = data["publishers"];
        if (participants) {
          participants.forEach((element: any) => {
            processPublisher(element);
          });
        }

        var left: number = data["unpublished"];
        if (left) {
          removeFromStreams(left);
        }
      }
    }

    function publish(state: boolean) {
      if (state || !publisherHandle || !publisherHandle.getUserMedia) {
        return;
      }

      state = true;

      publisherHandle
        .getUserMedia({ video: true, audio: true })
        .then(function (stream: any) {
          var pc = publisherHandle.createPeerConnection();
          dataChannel = pc.createDataChannel("events");
          addToStreams({
            stream,
            streaming: true,
            user: -1,
            muted: false,
            data: dataChannel,
          });
          stream.getTracks().forEach(function (track: any) {
            publisherHandle.addTrack(track, stream);
          });
        })
        .then(function () {
          return publisherHandle.createOffer();
        })
        .then(function (jsep: any) {
          return publisherHandle.sendWithTransaction({
            body: { audio: true, video: true, data: true, request: "publish" },
            jsep: jsep,
          });
        })
        .then(function (response: any) {
          var jsep = response.get("jsep");
          if (jsep) {
            publisherHandle.setRemoteSDP(jsep);
            return jsep;
          }
        })
        .catch(function (e: Error) {
          console.error(e);
        });
    }

    function onVideoroomJoin(response: any) {
      //console.log("Joined room")
      //console.log(publisherHandle)
      publish(isPublishing);
      participants = response.getPluginData()["publishers"];
      participants.forEach((element: any) => {
        processPublisher(element);
      });
    }

    function onSessionCreated(session: any) {
      roomSession = session;
      session
        .attachPlugin("janus.plugin.videoroom")
        .then(function (plugin: any) {
          publisherHandle = plugin;
          plugin
            .sendWithTransaction({
              body: { request: "join", room: 1234, ptype: "publisher" },
            })
            .then(onVideoroomJoin);
          plugin.on("message", onMessage);
          //plugin.detach();
        });
    }

    if (!running) {
      running = true;
      janus.createConnection("123").then(function (connection: any) {
        connectionHandle = connection;
        connection.createSession().then(onSessionCreated);
      });
    }

    return () => {
      connectionHandle.close();
      setStreams((prev) => []);
    };
  }, []);

  const [users, setUsers] = useState<GetUserInfoDto[]>([]);
  const [files, setFiles] = useState<RemoteFile[]>([]);
  const [event, setEvent] = useState<GetEventDto | null>(null);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<GetEventDto>(`/events/${id}`, {
          headers: {
            Authorization: `Bearer ${auth?.access_token}`,
          },
        });
        setEvent(data);
      } catch (e) {}
    })();
  }, [id]);

  return (
    <UserStoreContext.Provider value={{ users, setUsers }}>
      <StremChangeContext.Provider value={setStreams}>
        <StreamsContext.Provider value={streams}>
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
                  <VideoContainer />
                  <Sidebar />
                </section>
              </main>
            </EventContext.Provider>
          </FilesContext.Provider>
        </StreamsContext.Provider>
      </StremChangeContext.Provider>
    </UserStoreContext.Provider>
  );
}
