export interface IUser {
  id: string
  name: string
  email: string
  authToken?: string
}

export interface IAuthContext {
  user: IUser | null
  setUser: (user: IUser | null) => void
  login: (user: IUser) => void
  logout: () => void
}
