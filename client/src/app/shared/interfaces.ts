export interface User {
  login: string
  password: string
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
}

export interface Message {
  sender: User
  recipient: User
  time: Date
  type: number[]
  message: string[]
  read: boolean
  _id?: string
}

export interface Institution {
  name: string
  _id?: string
}

export interface Picture {
  readonly folder: boolean
  boysGreyPicture?: string
  girlsGreyPicture?: string
  boysColorPicture?: string
  girlsColorPicture?: string
  answers: Picture[]
  text?: string
  parent?: string
  p_sort: number
  invisible?: boolean
  readonly system: boolean
  user?: User
  many?: boolean
  _id?: string
}

export interface Folder {
  text: string
  many: boolean
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
