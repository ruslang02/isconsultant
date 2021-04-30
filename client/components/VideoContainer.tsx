import React, { useRef, useContext, useEffect, useState } from "react";
import { Actions } from "./Actions";
import "./User.d.ts";
import styles from "../styles/VideoContainer.module.css";
import { VideoItemContainer } from "./VideoItemContainer";
import Janus from "janus-gateway-js";
import VideoItem from "./VideoItem";
import "../videoroom";
import VideoMenu from "./VideoMenu";
import { useTranslation } from "react-i18next";
import { useAuth } from "utils/useAuth";
import router from "next/router";
import { GetEventDto } from "@common/dto/get-event.dto";

const VideoContainer: React.FC<{
  roomNumber: any;
  roomPin: any;
  roomSecret: any;
  event?: GetEventDto;
}> = function ({ roomNumber, roomPin, roomSecret, event }) {
  const [userState, setState] = useState<{ id, name }[]>([]);
  const userStream = useRef<MediaStream>(null);
  const [video, setVideo] = useState<boolean>(false);
  const [audio, setAudio] = useState<boolean>(false);
  const [screen, setScreen] = useState<boolean>(false);
  const [menuState, changeMenuState] = useState<Menu>({
    xPos: 0,
    yPos: 0,
    show: false,
    user: null,
    changeUser: null,
  });
  const [audioAvailable, changeAudioAvailable] = useState<boolean>(false);
  const [videoAvailable, changeVideoAvailable] = useState<boolean>(false);
  const [auth] = useAuth();

  // Not sure what to do with those just yet, but those have to go
  // Perhaps a class will be nice?
  // --vladoss
  // updated to ref for now - better than state
  const dataChannel = useRef<any>(null);
  const running = useRef<boolean>(false);
  const connectionHandle = useRef<any>(null);
  const roomSession = useRef<any>(null);
  const publisherHandle = useRef<any>(null);
  const isPublishing = useRef<boolean>(false);
  const screenHandle = useRef<any>(null);

  const { t } = useTranslation();

  useEffect(() => {
    console.log("mounted");

    function onMessage(message: any) {
      var data = message.getPluginData();
      if (data == null) {
        return;
      }

      if (data["videoroom"] == "event") {
        var participants = data["publishers"];
        if (participants) {
          participants.forEach((element: any) => {
            setState((e) => {
              e = [...e, { id: element["id"], name: element["display"] }];
              return e;
            });
          });
        }

        var left: number = data["unpublished"];
        if (left) {
          console.log(userState);
          setState((e) => {
            var i = e.findIndex(v => v.id == left)
            if (i == -1) return e;
            const n = [...e];
            n.splice(i, 1);
            return n;
          });
          console.log(userState);
        }

        var left: number = data["kicked"];
        if (left) {
          console.log(userState);
          setState((e) => {
            var i = e.findIndex(v => v.id == left)
            if (i == -1) return e;
            const n = [...e];
            n.splice(i, 1);
            return n;
          });
          console.log(userState);
        }

        var leaving: string = data["leaving"];
        var reason: string = data["reason"];
        console.log(data);

        if (leaving) {
          if (reason == "kicked") {
            alert(t("pages.video.room_kicked"));
            location.assign("/profile/@me");
          }
        }
      }
    }

    function publish(state: boolean) {
      if (
        state ||
        !publisherHandle.current ||
        !publisherHandle.current.getUserMedia
      ) {
        return;
      }

      state = true;

      publisherHandle.current
        .getUserMedia({ video: true })
        .then(function (stream: any) {
          changeVideoAvailable(true);
          publisherHandle.current
            .getUserMedia({ audio: true })
            .then(function (stream: any) {
              changeAudioAvailable(true);
              go(true, true);
            })
            .catch(function (stream: any) {
              go(true, false);
            });
        })
        .catch(function (stream: any) {
          publisherHandle.current
            .getUserMedia({ audio: true })
            .then(function (stream: any) {
              changeAudioAvailable(true);
              go(false, true);
            })
            .catch(function (stream: any) {
              go(false, false);
            });
        });

      function go(vi: boolean, au: boolean) {
        if (!au && !vi) {
          return;
        }

        console.log("hh");
        publisherHandle.current
          .getUserMedia({ video: vi, audio: au })
          .then(function (stream: any) {
            var pc = publisherHandle.current.createPeerConnection();
            dataChannel.current = pc.createDataChannel("events");

            dataChannel.current.onmessage = function (e: any) {
              console.log(e);
              if (JSON.parse(e["data"]["request"]))
                setAudio((a) => {
                  setVideo((v) => {
                    dataChannel.current.send({ muted: !a, streaming: v });
                    return v;
                  });
                  return a;
                });
            };

            userStream.current = stream;

            setAudio(au);
            setVideo(vi);

            stream.getTracks().forEach(function (track: any) {
              publisherHandle.current.addTrack(track, stream);
            });
          })
          .then(function () {
            return publisherHandle.current.createOffer();
          })
          .then(function (jsep: any) {
            return publisherHandle.current.sendWithTransaction({
              body: { audio: au, video: vi, data: true, request: "publish" },
              jsep: jsep,
            });
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
      isPublishing.current = true;
      var participants = response.getPluginData()["publishers"];
      var newUsers: { id, name }[] = [];
      participants.forEach((element: any) => {
        newUsers.push({ id: element["id"], name: element["display"] });
      });

      setState((e) => {
        e = newUsers;
        return e;
      });
    }

    function onSessionCreated(session: any) {
      roomSession.current = session;
      session
        .attachPlugin("janus.plugin.videoroom")
        .then(function (plugin: any) {
          publisherHandle.current = plugin;

          if (roomPin)
            plugin
              .sendWithTransaction({
                body: {
                  request: "join",
                  room: parseInt(roomNumber),
                  ptype: "publisher",
                  pin: roomPin.toString(),
                  display: auth.user.first_name + ' ' + auth.user.last_name
                },
              })
              .then(onVideoroomJoin)
              .catch(() => location.replace(location.pathname + "?wrongPin=true"));
          else
            plugin
              .sendWithTransaction({
                body: {
                  request: "join",
                  room: parseInt(roomNumber),
                  ptype: "publisher",
                  display: auth.user.first_name + ' ' + auth.user.last_name
                },
              })
              .then(onVideoroomJoin);
          plugin.on("message", onMessage);
          //plugin.detach();
        });
    }

    if (!running.current && auth?.access_token) {
      var janus = new Janus.Client(
        `${location.hostname == "localhost" ? "ws" : "wss"}://${location.hostname
        }${location.port ? ":" + location.port : ""}/gateway2?access_token=` +
        auth.access_token,
        {
          token: "",
          apisecret: "",
          keepalive: "true",
        }
      );

      janus.createConnection("123").then(function (connection: any) {
        connectionHandle.current = connection;
        connection.createSession().then(onSessionCreated);
      });
      running.current = true;
    }
  }, [userState, video, audio]);

  function clickAudio(enabled: boolean) {
    userStream.current.getAudioTracks()[0].enabled = enabled;
    dataChannel.current.send(
      JSON.stringify({ muted: !enabled, streaming: video })
    );

    setAudio(enabled);
  }

  function clickVideo(enabled: boolean) {
    userStream.current.getVideoTracks()[0].enabled = enabled;
    dataChannel.current.send(
      JSON.stringify({ muted: !audio, streaming: enabled })
    );

    setVideo(enabled);
  }

  function clickScreen(enabled: boolean) {
    function onScreenJoin() {
      // @ts-ignore
      navigator.mediaDevices.getDisplayMedia()
        .then(function (stream: any) {
          var pc = screenHandle.current.createPeerConnection();
          userStream.current = stream;
          stream.getTracks().forEach(function (track: any) {
            screenHandle.current.addTrack(track, stream);
          });
        })
        .then(function () {
          return screenHandle.current.createOffer();
        })
        .then(function (jsep: any) {
          return screenHandle.current.sendWithTransaction({
            body: { video: true, request: "publish" },
            jsep: jsep,
          });
        })
        .then(function (response: any) {
          var jsep = response.get("jsep");
          if (jsep) {
            screenHandle.current.setRemoteSDP(jsep);
            return jsep;
          }
        });
    }

    if (enabled) {
      roomSession.current
        .attachPlugin("janus.plugin.videoroom")
        .then(function (plugin: any) {
          screenHandle.current = plugin;

          if (roomPin)
            plugin
              .sendWithTransaction({
                body: {
                  request: "join",
                  room: parseInt(roomNumber),
                  ptype: "publisher",
                  pin: roomPin.toString(),
                  display: auth.user.first_name + ' ' + auth.user.last_name
                },
              })
              .then(onScreenJoin);
          else
            plugin
              .sendWithTransaction({
                body: {
                  request: "join",
                  room: parseInt(roomNumber),
                  ptype: "publisher",
                  display: auth.user.first_name + ' ' + auth.user.last_name
                },
              })
              .then(onScreenJoin);

          //plugin.detach();
        });
    } else {
      screenHandle.current.detach();
      screenHandle.current = null;
    }

    setScreen(enabled);
  }

  function onContainerClick(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.preventDefault();
    resetMenu();
  }

  function resetMenu() {
    changeMenuState((e) => ({ ...e, show: false }));
  }

  function kick(id: number) {
    if (!roomSecret) {
      alert("You don't have priveleges to do this.");
      return;
    }
    publisherHandle.current
      .sendWithTransaction({
        body: {
          request: "kick",
          secret: roomSecret,
          room: parseInt(roomNumber),
          id: id,
          pin: roomPin,
        },
      })
      .then();
  }

  return (
    <section
      className={styles.Video_container}
      onContextMenu={onContainerClick}
      onClick={onContainerClick}
    >
      <VideoMenu menuState={menuState} functions={{ kick: kick }} />
      <div className={styles.Video_container_items}>
        <VideoItem
          user={{
            name: `${auth.user.first_name} ${auth.user.last_name} (You)`,
            id: -1,
            muted: true,
            streaming: video,
            stream: userStream.current,
            data: null,
            volume: 0,
          }}
          changeMenu={(e) => e}
        />

        {userState.map((e) => (
          <VideoItemContainer
            key={e.id}
            userId={e.id}
            fullName={e.name}
            session={roomSession.current}
            changeMenu={changeMenuState}
            publisherHandle={publisherHandle}
            roomPin={roomPin}
            roomNumber={roomNumber}
          />
        ))}
      </div>
      <Actions
        audioAvailable={audioAvailable}
        videoAvailable={videoAvailable}
        audio={audio}
        video={video}
        changeAudio={clickAudio}
        changeVideo={clickVideo}
        changeScreen={clickScreen}
        screen={screen}
        event={event}
      />
    </section>
  );
};

export default VideoContainer;
