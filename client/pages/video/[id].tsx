import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Button, Icon, Input } from "semantic-ui-react";
import {io} from "socket.io-client";
import styles from './[id].module.css';
import "./videoroom"

//@ts-ignore
import Janus from "janus-gateway-js";
import { send } from "process";

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
    user: number,
    stream: any,
    streaming: boolean,
    muted: boolean,
    data: any
}

const StreamsContext = createContext([] as VideoStream[]);
const StremChangeContext = createContext(null as Function)


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

const VideoItem: React.FC<{ videoStream:VideoStream }> = function ({ videoStream }) {
    const ref = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (ref.current) {
            ref.current.muted = (videoStream.user == -1) || videoStream.muted;
            ref.current.autoplay = true;
            ref.current.srcObject = videoStream.stream;
        }
    }, [])

    return (
        <div className={styles.Video_item}>
                <video className={styles.Video_item_element} ref={ref} hidden={!videoStream.streaming}/>
                <div className={styles.Video_item_name} hidden={videoStream.streaming}>{videoStream.user}</div>
        </div>
    )
}

const VideoContainer: React.FC = function () {
    const streams = useContext(StreamsContext);

    return (<section className={styles.Video_container}>
        <div style={{ flexGrow: 1 }}></div>
        <div className={styles.Video_container_items}>
            {streams.map(e =>
                <VideoItem key={e.user} videoStream={e} />
            )}
        </div>
        <div style={{ flexGrow: 1 }}></div>
        <Actions />
    </section>);
};

const Actions: React.FC = function(){
    const streams = useContext(StreamsContext)
    const setStreams = useContext(StremChangeContext)

    const [mutedIcon, setMutedIcon] = useState(Boolean)
    const [videoIcon, setVideoIcon] = useState(Boolean)

    function sendData(){
        var localStream = streams.find(a=> a.user == -1)
        localStream.data.send(JSON.stringify({muted:muted, streaming: video}))
        console.log(localStream.data)
    }

    function onMuteClick() {
        muted = !muted;
        var localStream = streams.find(a=> a.user == -1)
        localStream.stream.getAudioTracks()[0].enabled = !muted;
        setMutedIcon((a) => muted)
        sendData()
        setStreams(h=>{
            var i = h.findIndex(a=> a.user == -1)
            var k = h.find(a=> a.user == -1)
            k.muted = muted
            var newH = [...h]
            newH.splice(i,1)
            return [...newH, k]
        })
    }

    function onVideoClick() {
        video = !video;
        var localStream = streams.find(a=> a.user == -1)
        localStream.stream.getVideoTracks()[0].enabled = video;
        setVideoIcon((a) => video)
        sendData()
        setStreams(h=>{
            var i = h.findIndex(a=> a.user == -1)
            var k = h.find(a=> a.user == -1)
            k.streaming = video;
            var newH = [...h]
            newH.splice(i,1)
            return [...newH, k]
        })
    }


    return (<div className={styles.Actions}>
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
            onClick={onVideoClick}
            icon
            primary
            circular
            style={{
                width: "64px",
                height: "64px",
                marginRight: "1rem"
            }}>
            <Icon style={{ width: "26px" }} name={videoIcon ? "video camera" : "video play"} size="large"></Icon>
        </Button>
        <Button
            onClick={onMuteClick}
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
                name={mutedIcon? "microphone slash" : "microphone"}
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
    </div>)
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
    const client = io('/', {path: '/chat/socket.io', upgrade: true})
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


// janus = new Janus.Client('ws://localhost:8188', {
//     token: '',
//     apisecret: '',
//     keepalive: 'true'
// });

janus = new Janus.Client('wss://consultant.infostrategic.com/gateway2', {
    token: '',
    apisecret: '',
    keepalive: 'true'
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
                        return [...previousStreams, stream]
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

                const newStreams = [...previousStreams]
                newStreams.splice(index, 1);
                return newStreams;
            });
        }


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
                                    addToStreams({ stream, streaming: true, user: publisher["id"], muted: false, data: undefined });
                                }

                                pc.ondatachannel = function (obj: any) {
                                    //console.log(obj)
                                    setStreams(a=>{
                                        var s = a.find(e => e.user == publisher["id"])

                                        obj.channel.onmessage = (event: any) =>{
                                            console.log(event)
                                            var data = JSON.parse(event["data"]);
                                            setStreams(b=>{
                                                var i = b.findIndex(e => e.user == publisher["id"])
                                                var d = b.find(e => e.user == publisher["id"])
                                                var newB = [...b]
                                                newB.splice(i, 1);
                                                d.muted = data["muted"]
                                                d.streaming = data["streaming"]
                                                console.log(d);
                                                console.log(b);
                                                return [...newB, d];
                                            })
                                        }
                                        
                                        s.data = obj.channel;
                                        return a;
                                    })
                                }

                                dataChannel = pc.createDataChannel("events")

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
                    plugin.sendWithTransaction({ body: { "request": "join", "room": 1234, "ptype": "subscriber", "feed": publisher["id"], "data":true } }).then(onRoomAsSubJoin);
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

            // if (data["videoroom"] == "joined") {
            //     participants = data["publishers"]
            //     participants.forEach((element: any) => {
            //         processPublisher(element);
            //     });
            // }

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
            if (state || !publisherHandle || !publisherHandle.getUserMedia) {
                return;
            }


            state = true;

            publisherHandle.getUserMedia({ "video": true, "audio": true })
                .then(function (stream: any) {
                    var pc = publisherHandle.createPeerConnection();
                    dataChannel = pc.createDataChannel("events")
                    addToStreams({ stream, streaming: true, user: -1, muted: false, data: dataChannel });
                    stream.getTracks().forEach(function (track: any) {
                        publisherHandle.addTrack(track, stream);
                    });
                })
                .then(function () {
                    return publisherHandle.createOffer();
                })
                .then(function (jsep: any) {
                    return publisherHandle.sendWithTransaction({ body: { audio: true, video: true, data: true, request: "publish" }, jsep: jsep });
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

        if (!running) {
            running = true;
            janus.createConnection('123').then(function (connection: any) {
                connectionHandle = connection;
                connection.createSession().then(onSessionCreated);
            });

        }

        return () => {
            connectionHandle.close();
            setStreams((prev) => [])
        }
    }, []);

    return (
        <StremChangeContext.Provider value={setStreams}>
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
        </StremChangeContext.Provider>
    );
}
