import React, { useEffect, useRef, useState } from "react";
import VideoItem from "./VideoItem";
import "./User.d.ts";

function processPublisher(publisher: any, roomSession: any, changeUser: React.Dispatch<React.SetStateAction<User>>, roomPin, roomNumber) {
    roomSession.attachPlugin("janus.plugin.videoroom")
        .then(function (plugin: any) {
            function onRoomAsSubJoin(response: any) {
                if (response.getPluginData().videoroom == "attached") {
                    const jsep = response.get("jsep");
                    if (jsep) {
                        const pc: any = plugin.createPeerConnection();
                        pc.ontrack = function (obj: any) {
                            const stream = obj.streams[0];
                            changeUser(e => ({
                                ...e,
                                stream: stream,
                                streaming: true
                            }));
                        };

                        pc.ondatachannel = function (obj: any) {
                            changeUser(e => {
                                obj.channel.send({ "request": true });

                                obj.channel.onmessage = (event: any) => {
                                    const data = JSON.parse(event.data);
                                    changeUser(b => ({
                                        ...b,
                                        muted: data.muted,
                                        streaming: data.streaming
                                    }));
                                };

                                return {
                                    ...e,
                                    data: obj.channel
                                };
                            });
                        };

                        pc.createDataChannel("events");

                        plugin.createAnswer(jsep).then(function (jsep: any) {
                            plugin.sendWithTransaction({ jsep: jsep, body: { request: "start" } }).then(function (response: any) {
                                if (response.getPluginData().started == "ok") {

                                }
                            });
                        });
                    }
                }
            }

            if (roomPin)
                plugin.sendWithTransaction({ body: { "request": "join", "room": parseInt(roomNumber), "ptype": "subscriber", "feed": publisher, "data": true, "pin": roomPin.toString() } }).then(onRoomAsSubJoin);
            else
                plugin.sendWithTransaction({ body: { "request": "join", "room": parseInt(roomNumber), "ptype": "subscriber", "feed": publisher, "data": true } }).then(onRoomAsSubJoin);

        }).catch(console.warn.bind(console));
}

function connect(userId: number, session: any, changeUser: React.Dispatch<React.SetStateAction<User>>, roomPin: any, roomNumber: any) {
    processPublisher(userId, session, changeUser, roomPin, roomNumber);

}

export const VideoItemContainer: React.FC<{ userId: number; session: any; changeMenu: any; publisherHandle: any; roomPin: any; roomNumber: any; fullName: string }> = function ({ userId, session, changeMenu, publisherHandle, roomPin, roomNumber, fullName }) {
    const connected = useRef<boolean>(false);
    const [user, changeUser] = useState<User>({
        name: fullName,
        id: userId,
        muted: false,
        stream: null,
        streaming: false,
        data: null,
        volume: 1
    });

    function menuShow(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();
        changeMenu(prev => ({
            ...prev,
            show: true,
            xPos: e.pageX,
            yPos: e.pageY,
            changeUser: changeUser,
            user: user
        }));
    }

    useEffect(() => {
        if (!connected.current) {
            connect(userId, session, changeUser, roomPin, roomNumber);
            connected.current = true;
        }
    });

    return <VideoItem user={user} changeMenu={menuShow} />;
};