type User = {
  name: string,
  id: number,
  muted: boolean,
  stream: any,
  streaming: boolean,
  data: any,
  volume: number
}

type Menu = {
  xPos: number,
  yPos: number,
  show: boolean,
  user: User
  changeUser: (k:(e:User) => User) => void
}


type VideoContainerState = {
  users: number[]
}