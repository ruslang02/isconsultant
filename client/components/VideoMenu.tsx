import React, { useEffect, useRef } from "react"
import { Menu } from "semantic-ui-react"
import styles from "styles/VideoMenu.module.css"
import { useTranslation } from "react-i18next";

const VideoMenu: React.FC<{ menuState: Menu, functions: { kick: Function } }> = function ({ menuState: menuState, functions: functions }) {
  const ref = useRef<HTMLInputElement>(null)
const { t } = useTranslation();
  useEffect(() => {
    if (ref.current && menuState.user)
      ref.current.valueAsNumber = menuState.user.volume
  })

  function onRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    menuState.changeUser(prev => ({
      ...prev,
      volume: e.target.valueAsNumber
    }))

    if (ref.current)
      ref.current.value = e.target.value
  }

  function onKick(e: any){
    e.stopPropagation()
    e.preventDefault()
    functions.kick(menuState.user.id)
  }

  function onMute(e: any){

  }

  if (menuState.show)
    return (
      <div className={styles.Video_Menu} style={{ top: menuState.yPos, left: menuState.xPos }} >
        <Menu vertical>
          <Menu.Item onClick={onKick}>
            {t('pages.video.kick')}
              </Menu.Item>
          <Menu.Item onClick={onMute}>
            {t('pages.video.mute')}
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