import React, { useRef, useContext, useEffect } from "react";
import "./User.d.ts"
import styles from "../styles/VideoContainer.module.css"


const VideoItem: React.FC<{ user: User, changeMenu: (arg0: ((arg0: Menu) => Menu)) => void }> = function ({ user: user, changeMenu: changeMenu }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.muted = user.muted
      ref.current.autoplay = true
      ref.current.srcObject = user.stream
    }
  }, [user.streaming])

  function contextMenu(e) {
    e.preventDefault()

    changeMenu(_ => ({ xPos: e.pageX, yPos: e.pageY, show: true }))
  }

  return (
    <div className={styles.Video_item}>
        <div className={styles.Video_item_name} hidden={user.streaming}>{user.name}</div>
        <video onContextMenu={contextMenu} className={styles.Video_item_element} ref={ref} hidden={!user.streaming}/>
    </div>
  )
}

export default VideoItem