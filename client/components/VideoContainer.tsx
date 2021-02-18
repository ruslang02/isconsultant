import React, { useRef, useContext, useEffect, useState } from "react";
import { Actions } from "./Actions";
import "./User.d.ts"
import styles from "../styles/VideoContainer.module.css"
import { VideoItemContainer } from "./VideoItemContainer"
import Janus from "janus-gateway-js";
import VideoItem from "./VideoItem";
import "pages/video/videoroom"
import VideoMenu from "./VideoMenu";

const VideoContainer: React.FC = function () {
  const [userState, setState] = useState<number[]>([]);
  const userStream = useRef<MediaStream>(null)
  const [video, setVideo] = useState<boolean>(false)
  const [audio, setAudio] = useState<boolean>(false)
  const [menuState, changeMenuState] = useState<Menu>({ xPos: 0, yPos: 0, show: false, user: null, changeUser: null })

  // Not sure what to do with those just yet, but those have to go
  // Perhaps a class will be nice? 
  // --vladoss
  // updated to ref for now - better than state
  const dataChannel = useRef<any>(null)
  const running = useRef<boolean>(false)
  const connectionHandle = useRef<any>(null)
  const roomSession = useRef<any>(null)
  const publisherHandle = useRef<any>(null)
  const isPublishing = useRef<boolean>(false)

  useEffect(() => {
    console.log("mounted");

    function onMessage(message: any) {
      var data = message.getPluginData();
      if (data == null) {
        return;
      }

      if (data["videoroom"] == "event") {
        var participants = data["publishers"]
        if (participants) {
          participants.forEach((element: any) => {
            setState(e => {
              e = [...e, element["id"]]
              return e
            })
          });
        }

        var left: number = data["unpublished"]
        if (left) {
          console.log(userState)
          setState(e => {
            var i = e.indexOf(left)
            if (i == -1) return e
            const n = [...e]
            n.splice(i, 1)
            return n
          })
          console.log(userState)
        }

        var left: number = data["kicked"]
        if (left) {
          console.log(userState)
          setState(e => {
            var i = e.indexOf(left)
            if (i == -1) return e
            const n = [...e]
            n.splice(i, 1)
            return n
          })
          console.log(userState)
        }

        var leaving: string = data["leaving"]
        var reason: string = data["reason"]
        if (leaving) {
          if (reason == "kicked")
            alert("Вас исключили из комнаты.")
        }
      }
    }

    function publish(state: boolean) {
      if (state || !publisherHandle.current || !publisherHandle.current.getUserMedia) {
        return;
      }

      state = true;

      publisherHandle.current.getUserMedia({ "video": true, "audio": true })
        .then(function (stream: any) {
          var pc = publisherHandle.current.createPeerConnection();
          dataChannel.current = pc.createDataChannel("events")
          userStream.current = stream
          setVideo(true)
          setAudio(true)
          stream.getTracks().forEach(function (track: any) {
            publisherHandle.current.addTrack(track, stream);
          });
        })
        .then(function () {
          return publisherHandle.current.createOffer();
        })
        .then(function (jsep: any) {
          return publisherHandle.current.sendWithTransaction({ body: { audio: true, video: true, data: true, request: "publish" }, jsep: jsep });
        })
        .then(function (response: any) {
          var jsep = response.get("jsep");
          if (jsep) {
            publisherHandle.current.setRemoteSDP(jsep);
            return jsep;
          }
        });
    }

    function onVideoroomJoin(response: any) {
      //console.log("Joined room")
      //console.log(publisherHandle)
      publish(isPublishing.current);
      isPublishing.current = true
      var participants = response.getPluginData()["publishers"]
      var newUsers: number[] = []
      participants.forEach((element: any) => {
        newUsers.push(element["id"])
      });

      setState(e => {
        e = newUsers
        return e
      })


    }

    function onSessionCreated(session: any) {
      roomSession.current = session
      session.attachPlugin("janus.plugin.videoroom").then(function (plugin: any) {
        publisherHandle.current = plugin
        plugin.sendWithTransaction({ body: { "request": "join", "room": 1234, "ptype": "publisher" } }).then(onVideoroomJoin);
        plugin.on('message', onMessage);
        //plugin.detach();
      });
    }

    if (!running.current) {
      var janus = new Janus.Client('wss://consultant.infostrategic.com/gateway2', {
        token: '',
        apisecret: '',
        keepalive: 'true'
      });

      janus.createConnection('123').then(function (connection: any) {
        connectionHandle.current = connection;
        connection.createSession().then(onSessionCreated);
      });
      running.current = true;
    }
  }, [userState])

  function changeAudio(enabled: boolean) {
    userStream.current.getAudioTracks()[0].enabled = enabled;
    dataChannel.current.send(JSON.stringify({ muted: !enabled, streaming: video }))

    setAudio(enabled)
  }

  function changeVideo(enabled: boolean) {
    userStream.current.getVideoTracks()[0].enabled = enabled;
    dataChannel.current.send(JSON.stringify({ muted: !audio, streaming: enabled }))

    setVideo(enabled)
  }

  function onContainerClick(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.preventDefault()
    resetMenu()
  }

  function resetMenu() {
    changeMenuState(e => ({ ...e, show: false }))
  }

  function kick(id: number) {
    publisherHandle.current.sendWithTransaction({ body: { "request": "kick", "secret": "adminpwd", "room": 1234, "id": id } }).then();
  }

  return (
    <section className={styles.Video_container} onContextMenu={onContainerClick} onClick={onContainerClick}>
      <VideoMenu menuState={menuState} functions={{ kick: kick }} />
      <div style={{ flexGrow: 1 }}></div>
      <div className={styles.Video_container_items}>
        <VideoItem user={{ name: "Me", id: -1, muted: true, streaming: video, stream: userStream.current, data: null, volume: 0 }} changeMenu={(e) => e} />


        {userState.map(e =>
          <VideoItemContainer key={e} userId={e} session={roomSession.current} changeMenu={changeMenuState} publisherHandle={publisherHandle} />
        )}
      </div>
      <div style={{ flexGrow: 1 }}></div>
      <Actions audio={audio} video={video} changeAudio={changeAudio} changeVideo={changeVideo} />
    </section>);
};

export default VideoContainer