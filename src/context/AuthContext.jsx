import { createContext, useEffect, useState } from 'react'
import * as api from '../lib/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(undefined) // undefined = yuklanmoqda, null = kirmagan

  // Sessiya sahifa yangilanganda saqlanadi (sessionStorage)
  useEffect(() => {
    let alive = true
    api.init().then(() => alive && setProfile(api.currentUser()))
    return () => {
      alive = false
    }
  }, [])

  const signIn = async (email, password) => setProfile(await api.login(email, password))
  const signUp = async (data) => {
    const user = await api.register(data)
    if (user.approval_status === 'approved') setProfile(user)
    return user
  }
  const signOut = () => {
    api.logout()
    setProfile(null)
  }
  return (
    <AuthContext.Provider value={{ profile, loading: profile === undefined, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
