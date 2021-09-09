import React, { useRef, useContext, useEffect, useState } from "react";
import "./User.d.ts";
import styles from "../styles/VideoContainer.module.css";

const VideoItem: React.FC<{
    user: User
    changeMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}> = function ({ user: user, changeMenu: changeMenu }) {
    const ref = useRef<HTMLVideoElement>(null);

    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        if (ref.current) {
            console.log(user.streaming);
            console.log(user.stream);
            ref.current.volume = user.volume;
            ref.current.muted = user.muted;
            ref.current.autoplay = true;
            ref.current.playsInline = true;
            if (!ref.current.srcObject) ref.current.srcObject = user.stream;
        }
    }, [user.streaming, user.volume, user.stream]);

    return (
        <div onContextMenu={changeMenu}
             className={
                 styles.Video_item +
        (true ? " " + styles.streaming : "") +
        (fullscreen ? " " + styles.fullscreen : "")
             }
             onClick={() => setFullscreen(!fullscreen)}>
            <div className={styles.Video_item_name}>{ user.name }</div>
            <video className={styles.Video_item_element} ref={ref} />
        </div>
    );
};

export default VideoItem;
