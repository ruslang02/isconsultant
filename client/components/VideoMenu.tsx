import React from "react"
import { Menu, Input } from "semantic-ui-react"
import styles from "styles/VideoMenu.module.css"

const VideoMenu: React.FC<{ menuState: Menu }> = function (menuState) {
  if (menuState.menuState.show)
    return (
      <div className={styles.Video_Menu} style={{ top: menuState.menuState.yPos, left: menuState.menuState.xPos }} >
        <Menu vertical>
          <Menu.Item>
            Исключить
              </Menu.Item>
          <Menu.Item>
            Выключить звук
              </Menu.Item>
          <Menu.Item>
            123
              </Menu.Item>
          <Menu.Item>
            <Input type="range"></Input>
          </Menu.Item>
        </Menu>
      </div>
    )
  else
    return null
}

export default VideoMenu