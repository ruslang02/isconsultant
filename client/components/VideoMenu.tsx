import React, { useEffect, useRef, useState } from "react"
import { Menu, Input } from "semantic-ui-react"
import styles from "styles/VideoMenu.module.css"

const VideoMenu: React.FC<{ menuState: Menu }> = function ({menuState: menuState}) {  
  const ref = useRef<HTMLInputElement>(null)
  
  useEffect(()=>{
    if(ref.current && menuState.user)
      ref.current.valueAsNumber = menuState.user.volume
  })

  function onRangeChange(e: React.ChangeEvent<HTMLInputElement>){
    menuState.changeUser(prev => ({
      ...prev,
      volume: e.target.valueAsNumber
    }))

    if(ref.current)
    ref.current.value = e.target.value
  }
  
  if (menuState.show)
    return (
      <div className={styles.Video_Menu} style={{ top: menuState.yPos, left: menuState.xPos }} >
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
            <input type="range" min={0} max={1} step={0.01} onChange={onRangeChange} ref={ref}></input>
          </Menu.Item>
        </Menu>
      </div>
    )
  else
    return null
}

export default VideoMenu