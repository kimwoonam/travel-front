import {FormEvent, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../contexts/AuthContext'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const {login} = useAuth()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/auth/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password, name})
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText)
      }

      const data = await res.json()
      setMessage('회원가입 성공!')
      // 회원가입 성공 시 자동 로그인
      console.log(data);
      login(data.token, data.email, data.name)
      setTimeout(() => {
        navigate('/boards')
      }, 1000)
    } catch (err: any) {
      setMessage(err.message || '에러 발생')
    }
  }

  return (
      <div style={{maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui, -apple-system'}}>
        <h2>회원가입</h2>
        <form onSubmit={onSubmit} style={{display: 'grid', gap: 12}}>
          <label>
            이름
            <input value={name} onChange={e => setName(e.target.value)} required/>
          </label>
          <label>
            이메일
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
          </label>
          <label>
            비밀번호 (6자 이상)
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                   required minLength={6}/>
          </label>
          <button type="submit">가입</button>
        </form>
        {message && <p style={{marginTop: 12}}>{message}</p>}
      </div>
  )
}
