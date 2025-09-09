import {FormEvent, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const {isLoggedIn, login} = useAuth()

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/boards')
    }
  }, [isLoggedIn, navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText)
      }

      const data = await res.json()
      setMessage('로그인 성공!')
      // 로그인 상태 업데이트 (JWT 토큰 포함)
      login(data.token, data.email, data.displayName)

    } catch (err: any) {
      setMessage(err.message || '에러 발생')
    }
  }

  return (
      <div style={{maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui, -apple-system'}}>
        <h2>로그인</h2>
        <form onSubmit={onSubmit} style={{display: 'grid', gap: 12}}>
          <label>
            이메일
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
          </label>
          <label>
            비밀번호
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                   required/>
          </label>
          <button type="submit">로그인</button>
        </form>
        {message && <p style={{marginTop: 12}}>{message}</p>}
      </div>
  )
}
