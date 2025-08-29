import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  token: string | null
  userEmail: string | null
  userDisplayName: string | null
  login: (token: string, email: string, displayName: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null)

  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 로그인 상태 확인
    const savedToken = localStorage.getItem('token')
    const savedEmail = localStorage.getItem('userEmail')
    const savedDisplayName = localStorage.getItem('userDisplayName')

    if (savedToken && savedEmail) {
      setIsLoggedIn(true)
      setToken(savedToken)
      setUserEmail(savedEmail)
      setUserDisplayName(savedDisplayName)
    }
  }, [])

  const login = (token: string, email: string, displayName: string) => {
    setIsLoggedIn(true)
    setToken(token)
    setUserEmail(email)
    setUserDisplayName(displayName)
    localStorage.setItem('token', token)
    localStorage.setItem('userEmail', email)
    localStorage.setItem('userDisplayName', displayName)
    localStorage.setItem('isLoggedIn', 'true')
  }

  const logout = () => {
    setIsLoggedIn(false)
    setToken(null)
    setUserEmail(null)
    setUserDisplayName(null)
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userDisplayName')
    localStorage.removeItem('isLoggedIn')
  }

  return (
      <AuthContext.Provider value={{isLoggedIn, token, userEmail, userDisplayName, login, logout}}>
        {children}
      </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
