import {FormEvent, useState} from 'react'
import {useAuth} from '../../contexts/AuthContext'

export default function DeletePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const {token} = useAuth()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    try {
      const headers: Record<string, string> = {'Content-Type': 'application/json'}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const params = new URLSearchParams({email, password})
      // @ts-ignore
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8080'}/api/auth/delete?${params.toString()}`, {
        method: 'DELETE',
        headers
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }
      setMessage('회원탈퇴 완료')
    } catch (err: any) {
      setMessage(err.message || '에러 발생')
    }
  }

  return (
      <div style={{maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui, -apple-system'}}>
        <h2>회원탈퇴</h2>
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
          <button type="submit" style={{background: '#c62828', color: 'white'}}>탈퇴</button>
        </form>
        {message && <p style={{marginTop: 12}}>{message}</p>}
      </div>
  )
}
