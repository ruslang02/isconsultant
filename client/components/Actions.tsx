import styles from "../styles/Actions.module.css"
import React, { useContext, useState } from "react"
import { Button, Icon } from "semantic-ui-react"
import video from "pages/video";

export const Actions: React.FC<{audio: boolean, video: boolean, changeAudio: Function, changeVideo: Function}> = function({audio, video, changeAudio, changeVideo}){
  function onVideoClick(e: any) {
    changeVideo(!video)
  }

  function onAudioClick(e:any) {
    changeAudio(!audio)
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
          <Icon style={{ width: "26px" }} name={video ? "video camera" : "video play"} size="large"></Icon>
      </Button>
      <Button
          onClick={onAudioClick}
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
              name={!audio ? "microphone slash" : "microphone"}
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
