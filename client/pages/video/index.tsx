import { LegacyRef, useRef } from "react";
import { Button, Input } from "semantic-ui-react";
import { useTranslation } from "react-i18next";

function RoomSelect() {
  var roomName = 0;

  function onClick(e) {
    location.href = "/video/" + roomName;
  }

  function onChange(e, d) {
    roomName = d.value;
  }

  const { t } = useTranslation();

  return (
    <div style={{ display: "flex" }}>
      <Input onChange={onChange}></Input>
      <Button onClick={onClick}>{t("pages.video.join_room")}</Button>
    </div>
  );
}

export default function VideoHome() {
  return <RoomSelect></RoomSelect>;
}
