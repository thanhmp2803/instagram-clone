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

export interface FormField {
  id: keyof FormState
  type: 'email' | 'password' | 'text'
  placeholder: string
}

export interface FormState {
  email: string
  password: string
  fullName: string
  username: string
}
