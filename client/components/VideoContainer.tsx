import React, { useRef, useContext, useEffect, useState } from "react";
import { Actions } from "./Actions";
import "./User.d.ts"
import styles from "../styles/VideoContainer.module.css"
import { VideoItemContainer } from "./VideoItemContainer"
import Janus from "janus-gateway-js";
import VideoItem from "./VideoItem";
import "../videoroom"
import VideoMenu from "./VideoMenu";
import { useTranslation } from "react-i18next";

const VideoContainer: React.FC<{ roomNumber: any, roomPin: any, roomSecret: any }> = function ({ roomNumber, roomPin, roomSecret }) {
  const [userState, setState] = useState<number[]>([]);
  const userStream = useRef<MediaStream>(null)
  const [video, setVideo] = useState<boolean>(false)
  const [audio, setAudio] = useState<boolean>(false)
  const [menuState, changeMenuState] = useState<Menu>({ xPos: 0, yPos: 0, show: false, user: null, changeUser: null })
  const [audioAvailable, changeAudioAvailable] = useState<boolean>(false)
  const [videoAvailable, changeVideoAvailable] = useState<boolean>(false)

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

  const { t } = useTranslation();

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
        console.log(data)

        if (leaving) {
          if (reason == "kicked")
            alert(t('pages.video.room_kicked'))
            location.href = "/video"
        }
      }
    }

    function publish(state: boolean) {
      if (state || !publisherHandle.current || !publisherHandle.current.getUserMedia) {
        return;
      }

      state = true;

      var audio = false;
      var video = false

      navigator.getUserMedia({ video: true }, function (stream: any) {
        video = true;
        changeVideoAvailable(true);
        navigator.getUserMedia({ audio: true }, function (stream: any) {
          audio = true;
          changeAudioAvailable(true);
          go()
        }, function (stream: any) {
          go()
        })
      }, function (stream: any) {
        navigator.getUserMedia({ audio: true }, function (stream: any) {
          audio = true;
          changeAudioAvailable(true);
          go()
        }, function (stream: any) {
          go()
        })
      })

      function go() {
        if (!audio && !video) {
          return
        }

        publisherHandle.current.getUserMedia({ "video": video, "audio": audio })
          .then(function (stream: any) {
            var pc = publisherHandle.current.createPeerConnection();
            dataChannel.current = pc.createDataChannel("events")

            dataChannel.current.onmessage = function (e: any) {
              console.log(e)
              if (JSON.parse(e["data"]["request"]))
                setAudio(a => {
                  setVideo(v => {
                    dataChannel.current.send({ "muted": !a, "streaming": v })
                    return v
                  })
                  return a
                })
            }

            userStream.current = stream
            setVideo(video)
            setAudio(audio)
            stream.getTracks().forEach(function (track: any) {
              publisherHandle.current.addTrack(track, stream);
            });
          })
          .then(function () {
            return publisherHandle.current.createOffer();
          })
          .then(function (jsep: any) {
            return publisherHandle.current.sendWithTransaction({ body: { audio: audio, video: video, data: true, request: "publish" }, jsep: jsep });
          })
          .then(function (response: any) {
            var jsep = response.get("jsep");
            if (jsep) {
              publisherHandle.current.setRemoteSDP(jsep);
              return jsep;
            }
          });
      }
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

        if (roomPin)
          plugin.sendWithTransaction({ body: { "request": "join", "room": parseInt(roomNumber), "ptype": "publisher", "pin": roomPin.toString() } }).then(onVideoroomJoin);
        else
          plugin.sendWithTransaction({ body: { "request": "join", "room": parseInt(roomNumber), "ptype": "publisher" } }).then(onVideoroomJoin);
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
    if(!roomSecret)
    {
      alert("You don't have priveleges to do this.")
      return
    }
    publisherHandle.current.sendWithTransaction({ body: { "request": "kick", "secret": roomSecret, "room": parseInt(roomNumber), "id": id, "pin": roomPin } }).then();
  }

  return (
    <section className={styles.Video_container} onContextMenu={onContainerClick} onClick={onContainerClick}>
      <VideoMenu menuState={menuState} functions={{ kick: kick }} />
      <div style={{ flexGrow: 1 }}></div>
      <div className={styles.Video_container_items}>
        <VideoItem user={{ name: t('pages.video.you'), id: -1, muted: true, streaming: video, stream: userStream.current, data: null, volume: 0 }} changeMenu={(e) => e} />


        {userState.map(e =>
          <VideoItemContainer key={e} userId={e} session={roomSession.current} changeMenu={changeMenuState} publisherHandle={publisherHandle} roomPin={roomPin} roomNumber={roomNumber}/>
        )}
      </div>
      <div style={{ flexGrow: 1 }}></div>
      <Actions audioAvailable={audioAvailable} videoAvailable={videoAvailable} audio={audio} video={video} changeAudio={changeAudio} changeVideo={changeVideo} />
    </section>);
};

export default VideoContainer