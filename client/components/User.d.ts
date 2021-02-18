type User = {
  name: string,
  id: number,
  muted: boolean,
  stream: any,
  streaming: boolean,
  data: any
}

type Menu = {
  xPos: number,
  yPos: number,
  show: boolean
}


type VideoContainerState = {
  users: number[]
}