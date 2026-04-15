import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UserState = {
  id: string | null
  name: string | null
  email: string | null
  avatarUrl: string | null
  role: 'user' | 'admin' | null
  isLoggedIn: boolean
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  avatarUrl: null,
  role: null,
  isLoggedIn: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Omit<UserState, 'isLoggedIn'>>) {
      state.id = action.payload.id
      state.name = action.payload.name
      state.email = action.payload.email
      state.avatarUrl = action.payload.avatarUrl
      state.role = action.payload.role
      state.isLoggedIn = !!action.payload.id
    },
    clearUser(state) {
      state.id = null
      state.name = null
      state.email = null
      state.avatarUrl = null
      state.role = null
      state.isLoggedIn = false
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
