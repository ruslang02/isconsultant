import styles from "../styles/Actions.module.css"
import React, { useContext, useState } from "react"
import { Button, Icon } from "semantic-ui-react"
import video from "pages/video";
import { useRouter } from "next/router";
import { GetEventDto } from "@common/dto/get-event.dto";

export const Actions: React.FC<{
    audioAvailable: boolean
    videoAvailable: boolean
    audio: boolean
    video: boolean
    changeAudio: (_: boolean) => void
    changeVideo: (_: boolean) => void
    changeScreen: (_: boolean) => void
    screen: boolean,
    event?: GetEventDto
}> = x => {
    const router = useRouter();

    return (<div className={styles.Actions}>
        <Button
            onClick={() => x.changeScreen(!x.screen)}
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
            disabled={!x.videoAvailable}
            onClick={() => x.changeVideo(!x.video)}
            icon
            primary
            circular
            style={{
                width: "64px",
                height: "64px",
                marginRight: "1rem"
            }}>
            <Icon style={{ width: "26px" }} name={x.video ? "video camera" : "video play"} size="large"></Icon>
        </Button>
        <Button
            disabled={!x.audioAvailable}
            onClick={() => x.changeAudio(!x.audio)}
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
                name={!x.audio ? "microphone slash" : "microphone"}
                size="large"></Icon>
        </Button>
        <Button
            onClick={() => location.assign("/profile/@me?from="
                + btoa(
                    JSON.stringify({
                        id: x.event?.owner.id,
                        name: x.event?.owner.first_name + " " + x.event?.owner.last_name
                    })
                ))}
            icon
            color="red"
            circular
            style={{
                width: "64px",
                height: "64px",
                marginRight: "1rem"
            }}>
            <Icon
                style={{ width: "26px" }}
                name="call"
                size="large"></Icon>
        </Button>
    </div>)
};
