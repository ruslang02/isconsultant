import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Button, Icon, Input } from "semantic-ui-react";
import styles from './[id].module.css';
import "./videoroom"

//@ts-ignore
import Janus from "janus-gateway-js";

var roomSession: any = undefined;
var publisherHandle: any = undefined;
var participants: any = undefined;
var isPublishing: boolean = false;
var janus: any = undefined;
var connectionHandle: any = undefined;
var subscriberHandles: any[] = [];


type VideoStream = {
    user: number,
    stream: any,
    streaming: boolean
}

const StreamsContext = createContext([] as VideoStream[]);

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

const VideoItem: React.FC<{ name: number, stream: any, streaming: boolean }> = function ({ name, stream, streaming }) {
    const ref = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (ref.current) {
            ref.current.muted = true;
            ref.current.autoplay = true;
            ref.current.srcObject = stream;
        }
    }, [])

    return (
        <div className={styles.Video_item}>
            {streaming ?
                <video className={styles.Video_item_element} ref={ref} />
                :
                <div className={styles.Video_item_name}>{name}</div>}
        </div>
    )
}

const VideoContainer: React.FC = function () {
    const streams = useContext(StreamsContext);
    return (<section className={styles.Video_container}>
        <div style={{ flexGrow: 1 }}></div>
        <div className={styles.Video_container_items}>
            {streams.map(({ stream, streaming, user }) =>
                <VideoItem name={user} key={user} stream={stream} streaming={streaming} />
            )}
        </div>
        <div style={{ flexGrow: 1 }}></div>
        <Actions />
    </section>);
};

const Actions: React.FC = () => (
    <div className={styles.Actions}>
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
            primary
            circular
            style={{
                width: "64px",
                height: "64px",
                marginRight: "1rem"
            }}>
            <Icon style={{ width: "26px" }} name="video camera" size="large"></Icon>
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


janus = new Janus.Client('wss://consultant.infostrategic.com/gateway2', {
    token: '',
    apisecret: '',
    keepalive: 'true'
});

export default function Video() {
    const router = useRouter();
    const { id } = router.query;

    const [streams, setStreams] = useState<VideoStream[]>([]);

    const addToStreams = (stream: VideoStream) => {
        if (!streams.find((a) => a.user === stream.user)) {
            setStreams(streams => (
                [...streams, stream]
            ));
        } else {
            console.warn("Was trying to add the same user.");
        }
    };

    const removeFromStreams = (id: number) => {
        const index = streams.findIndex((a) => a.user === id);
        if (index === -1) {
            return;
        }
        const newStreams = [...streams]
        newStreams.splice(index, 1);
        setStreams(newStreams);
    }

    useEffect(() => {
        console.log("mounted");
        function processPublisher(publisher: any) {
            roomSession.attachPlugin("janus.plugin.videoroom")
                .then(function (plugin: any) {
                    function onRoomAsSubJoin(response: any) {
                        //console.log(response);

                        if (response.getPluginData()["videoroom"] == "attached") {
                            var jsep = response.get("jsep");
                            if (jsep) {
                                var pc: any = plugin.createPeerConnection();
                                pc.onaddstream = function (obj: any) {
                                    const { stream } = obj;
                                    addToStreams({ stream, streaming: true, user: publisher["id"] });
                                }
                                plugin.createAnswer(jsep).then(function (jsep: any) {
                                    plugin.sendWithTransaction({ jsep: jsep, body: { request: "start" } }).then(function (response: any) {
                                        if (response.getPluginData()["started"] == "ok") {
                                            //console.log("Success")
                                        }
                                    })
                                });
                            }
                        }
                    }


                    subscriberHandles.push(plugin);
                    plugin.sendWithTransaction({ body: { "request": "join", "room": 1234, "ptype": "subscriber", "feed": publisher["id"] } }).then(onRoomAsSubJoin);
                    //plugin.on('message', onMessage);
                    //plugin.detach();
                }).catch(console.warn.bind(console));
        }

        function onMessage(message: any) {
            var data = message.getPluginData();
            if (data == null) {
                return;
            }

            //console.log(data);

            if (data["videoroom"] == "joined") {
                participants = data["publishers"]
                participants.forEach((element: any) => {
                    processPublisher(element);
                });
            }

            if (data["videoroom"] == "event") {
                participants = data["publishers"]
                if (participants) {
                    participants.forEach((element: any) => {
                        processPublisher(element);
                    });
                }

                var left: number = data["unpublished"]
                if (left) {
                    removeFromStreams(left)
                }
            }
        }

        function publish(state: boolean) {
            if (state) {
                return;
            }


            state = true;

            publisherHandle.getUserMedia({ "video": true, "audio": true })
                .then(function (stream: any) {
                    addToStreams({ stream, streaming: true, user: -1 });
                    publisherHandle.createPeerConnection();
                    stream.getTracks().forEach(function (track: any) {
                        publisherHandle.addTrack(track, stream);
                    });
                })
                .then(function () {
                    return publisherHandle.createOffer();
                })
                .then(function (jsep: any) {
                    return publisherHandle.sendWithTransaction({ body: { audio: true, video: true, request: "publish" }, jsep: jsep });
                })
                .then(function (response: any) {
                    var jsep = response.get("jsep");
                    if (jsep) {
                        publisherHandle.setRemoteSDP(jsep);
                        return jsep;
                    }
                });
        }



        function onVideoroomJoin(response: any) {
            //console.log("Joined room")
            //console.log(publisherHandle)
            publish(isPublishing);
            participants = response.getPluginData()["publishers"]
            participants.forEach((element: any) => {
                processPublisher(element);
            });
        }

        function onSessionCreated(session: any) {
            roomSession = session;
            session.attachPlugin("janus.plugin.videoroom").then(function (plugin: any) {
                publisherHandle = plugin;
                plugin.sendWithTransaction({ body: { "request": "join", "room": 1234, "ptype": "publisher" } }).then(onVideoroomJoin);
                plugin.on('message', onMessage);
                //plugin.detach();
            });
        }

        janus.createConnection('123').then(function (connection: any) {
            connectionHandle = connection;
            connection.createSession().then(onSessionCreated);
        });

        return () => {
            connectionHandle.close();
            setStreams((prev) => [])
        }
    }, []);

    return (
        <StreamsContext.Provider value={streams}>
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
    );
}
