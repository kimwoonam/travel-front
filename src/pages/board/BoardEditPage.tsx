import { FormEvent, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface Board {
  id: number
  uuid: string
  title: string
  content: string
  author: string
  createdAt: string
}

export default function BoardEditPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const { isLoggedIn, token } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // 로그인되지 않은 사용자가 접근하면 홈페이지로 리다이렉트
    if (!isLoggedIn) {
      navigate('/')
      return
    }

    if (uuid) {
      fetchBoardDetail()
    }
  }, [uuid, isLoggedIn, navigate])

  async function fetchBoardDetail() {

    try {

      const headers: Record<string, string> = {'Content-Type': 'application/json'}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080'}/api/boards/${uuid}`, {
        headers
      })
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('게시글을 찾을 수 없습니다.')
        }
        throw new Error('게시글을 불러올 수 없습니다.')
      }
      const data = await res.json()
      setBoard(data)
      setTitle(data.title)
      setContent(data.content)
      setAuthor(data.author)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !author.trim()) {
      setMessage('모든 필드를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080'}/api/boards/${uuid}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ title, content, author })
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || '게시글 수정에 실패했습니다.')
      }

      setMessage('게시글이 성공적으로 수정되었습니다!')
      setTimeout(() => {
        navigate(`/boards/${uuid}`)
      }, 1500)
    } catch (err: any) {
      setMessage(err.message || '에러가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>로딩 중...</div>
  if (error) return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'system-ui, -apple-system' }}>
      <div style={{ textAlign: 'center', color: 'red', marginBottom: 20 }}>{error}</div>
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/boards')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          게시판 목록으로 돌아가기
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'system-ui, -apple-system' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h2>게시글 수정</h2>
        <button 
          onClick={() => navigate(`/boards/${uuid}`)}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          취소
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 20 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            제목 *
          </label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="게시글 제목을 입력하세요"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            작성자 *
          </label>
          <input 
            type="text" 
            value={author} 
            onChange={e => setAuthor(e.target.value)} 
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="작성자 이름을 입력하세요"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            내용 *
          </label>
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            required
            rows={10}
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder="게시글 내용을 입력하세요"
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button 
            type="button"
            onClick={() => navigate(`/boards/${uuid}`)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            취소
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: isSubmitting ? '#ccc' : '#28a745', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isSubmitting ? '수정 중...' : '게시글 수정'}
          </button>
        </div>
      </form>

      {message && (
        <div style={{ 
          marginTop: 20, 
          padding: '12px', 
          borderRadius: '4px',
          backgroundColor: message.includes('성공') ? '#d4edda' : '#f8d7da',
          color: message.includes('성공') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('성공') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}
    </div>
  )
}
