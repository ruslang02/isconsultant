import { LegacyRef, useRef } from "react";
import { Button, Input } from "semantic-ui-react";

function RoomSelect(){
  var roomName = 0; 

  function onClick(e){
    location.href = "/video/" + roomName;
  }

  function onChange(e, d){
    roomName = d.value;
  }

  return(<div style={{display: "flex"}}>
    <Input onChange={onChange}></Input>
    <Button onClick={onClick}>Join</Button>
  </div>);
}

export default function VideoHome(){
  return(<RoomSelect></RoomSelect>);
}