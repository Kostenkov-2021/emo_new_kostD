export interface User {
  login: string
  password?: string
  name: string
  surname: string
  birthDate?: Date
  sex: number
  institution: string
  levelStatus: number
  photo?: string
  onlineStatus: string
  online?: boolean
  text?: boolean
  read?: boolean
  surnameView?: boolean
  _id?: string
  setting?: number
  vote?: boolean
  sentence?: boolean
  answers?: boolean
  change?: boolean
  defaultColor?: string
  birthdays?: boolean
  time?: boolean
  firstColor?: string
  secondColor?: string
  last_active_at?: Date
  active?: boolean
  events?: boolean
  screenreader?: boolean
  games?: boolean
  score?: number
  info?: string
  videorooms?: boolean
  id?: string
  
}

export interface Users {
  withMessageUsers: User[]
  withoutMessageUsers: User[]
}

export interface Message {
  sender?: string
  recipient?: string
  time?: Date
  type: number[]
  message: string[]
  read?: boolean
  _id?: string
}

export interface Messages {
  messagesRead: Message[]
  messagesNotRead: Message[]
}

export interface Institution {
  name: string
  img?: string
  region?: string
  _id?: string
}

export interface Region {
  name: string
  _id?: string
}

export interface Picture {
  readonly folder: boolean
  boysGreyPicture?: string
  girlsGreyPicture?: string
  boysColorPicture?: string
  girlsColorPicture?: string
  answers: string[]
  exceptions?: string[]
  text?: string
  textForGirls?: string
  parent?: string
  p_sort: number
  invisible?: boolean
  readonly system: boolean
  user?: string
  many?: number
  _id?: string
  src?: string
  textInHTML?: string
  color?: number
  show?: boolean
}

export interface Folder {
  text: string
  many: number
  parent?: string
  _id?: string
}

export interface PictureAndFolder {
  pictures: Picture[]
  folder: Folder
}

export interface MessageFromServer {
  message: string
}

export interface Filter {
  login?: string
  name?: string
  surname?: string
  institution?: string
  sex?: string
  levelStatus?: string
  status?: string
}

export interface Answers {
  answers: Picture[]
}

export interface BotButton {
  img: string
  text: string
  type: number
  _id?: string
}

export interface Event {
  autor: string
  participants?: string[] 
  hide?: string[]
  wait?: string[] 
  date?: Date
  type: number
  description?: string
  address?: string
  cost?: number
  status: number
  chatImage?: string
  createTime?: Date
  institution?: string
  _id?: string
  photolikes?: string[]
  chatTitle?: string
  likes?: string[]
  p_status?: boolean
  institutions?: string[]
  roles?: number[]
  sex?: number
  participantsNames?: User[]
  hideNames?: User[]
}

export interface GroupMessage {
  sender?: string
  group?: string
  time?: Date
  type: number[]
  message: string[]
  read?: string[]
  wait?: string[]
  _id?: string
  senderName?: string
  senderPhoto?: string
}

export interface TBItem {
  item: string
  parent?: string
  src?: string
  _id?: string
}

export interface GameSession {
  user?: string
  level: string
  game: number
  time?: Date
  score: number
  _id?: string
}

export interface VideoRoom {
  author: string
  privateLevel: number
  users: any
  image?: string
  createTime?: Date
  _id?: string
  title: string
  active?: number
  author_ref?: User
}

export interface VideoRoomMessage {
  sender?: string
  room?: string
  time?: Date
  type: number
  message: string
  read?: string[]
  _id?: string
  senderName?: string
}

export interface VideoUser {
  id?: string
  name: string
  _id?: string
}