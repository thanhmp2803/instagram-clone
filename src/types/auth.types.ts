export interface IUser {
  id: string
  name: string
  email: string
  username?: string
  avatar?: string
  authToken?: string
}

export interface IAuthContext {
  user: IUser | null
  loading: boolean
  setUser: (user: IUser | null) => void
  login: (userOrEmail: IUser | string, password?: string) => Promise<{ error: Error | null } | void>
  signUp: (
    email: string,
    password: string,
    fullName: string,
    username: string,
  ) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
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
