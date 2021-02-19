import { useRef, useState } from "react";
import { Button, Input } from "semantic-ui-react";
import Janus from "janus-gateway-js"

function RoomSelect() {
  const [roomName, changeRoomName] = useState<string>(null);
  const [pin, changePin] = useState<number>(null);
  const pinCreate = useRef<number>(null);
  const roomNumberCreate = useRef<number>(null);
  const secretCreate = useRef<string>(null)
  const secret = useRef<string>(null)

  function onJoinClick(e) {
    var params: string = ""
    if (pin || secret.current)
      params += '?'

    if (pin)
      params += "pin=" + pin

    if (secret.current)
      params += "&secret=" + secret.current

    location.href = "/video/" + roomName + params;
  }

  function onRoomNameChange(e, d) {
    changeRoomName(d.value);
  }

  function onPinChange(e, d) {
    changePin(d.value)
  }

  function onCreateRoomSecretChange(e, d) {
    secretCreate.current = d.value
  }

  function onCreateRoomNumberChange(e, d) {
    roomNumberCreate.current = parseInt(d.value)
  }

  function onCreateRoomPinChange(e, d) {
    pinCreate.current = d.value
  }

  function onSecretChange(e, d) {
    secret.current = d.value
  }

  function onCreateClick(e, d) {
    var connectionHandle = null;
    var publisherHandle = null;
    var janus = new Janus.Client('wss://consultant.infostrategic.com/gateway2', {
      token: '',
      apisecret: '',
      keepalive: 'true'
    });

    janus.createConnection('123').then(function (connection: any) {
      connectionHandle = connection;
      connection.createSession().then(function (session: any) {
        session.attachPlugin("janus.plugin.videoroom").then(function (plugin: any) {
          publisherHandle = plugin
          plugin.sendWithTransaction({ body: { request: "create", room: roomNumberCreate.current, pin: pinCreate.current, secret: secretCreate.current } }).then(function (response: any) {
            var r = response.getPluginData()
            console.log(response)
            connection.close()
          });
        });
      });
    });
  }

  return (<>
    <div style={{ display: "flex", flexDirection: "column", padding: "5px" }}>
      <div style={{ margin: "5px" }}>
        <Input placeholder={"Room"} onChange={onRoomNameChange}></Input>
      </div>
      <div style={{ margin: "5px" }}>
        <Input placeholder={"Pin"} onChange={onPinChange}></Input>
      </div>
      <div style={{ margin: "5px" }}>
        <Input placeholder={"Secret"} onChange={onSecretChange}></Input>
      </div>
      <div style={{ margin: "5px" }}>
        <Button onClick={onJoinClick}>Join</Button>
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", padding: "5px" }}>
      <div style={{ margin: "5px" }}>
        <Input placeholder={"Room number to create"} onChange={onCreateRoomNumberChange}></Input>
      </div>
      <div style={{ margin: "5px" }}>
        <Input placeholder={"Pin for created room"} onChange={onCreateRoomPinChange}></Input>
      </div>
      <div style={{ margin: "5px" }}>
        <Input placeholder={"Secret for created room"} onChange={onCreateRoomSecretChange}></Input>
      </div>
      <div style={{ margin: "5px" }}>
        <Button onClick={onCreateClick}>Join</Button>
      </div>
    </div>
  </>);
}

export default function VideoHome() {
  return (
    <div style={{ margin: "-100px 0 0 -150px", position: "absolute", top: "50%", left: "50%", width: "300px", height: "200px" }}>
      <RoomSelect />
    </div>
  );
}