import {useEffect, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../../contexts/AuthContext'

interface Board {
  id: number
  uuid: string
  title: string
  content: string
  author: string
  createdAt: string
}

export default function BoardListPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const {logout, token} = useAuth()

  useEffect(() => {
    fetchBoards()
  }, [])

  async function fetchBoards() {
    try {
      console.log('게시판 목록을 불러오는 중...')
      const headers: Record<string, string> = {'Content-Type': 'application/json'}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080'}/api/boards`, {
        headers
      })
      console.log('응답 상태:', res.status, res.statusText)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('API 오류:', errorText)
        throw new Error(`게시판 목록을 불러올 수 없습니다. (${res.status})`)
      }

      const data = await res.json()
      console.log('받은 데이터:', data)
      setBoards(data)
    } catch (err: any) {
      console.error('에러 발생:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function addSampleData() {
    try {
      console.log('샘플 데이터 추가 중...')
      const headers: Record<string, string> = {'Content-Type': 'application/json'}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080'}/api/boards/init`, {
        method: 'POST',
        headers
      })
      console.log('샘플 데이터 응답 상태:', res.status, res.statusText)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('샘플 데이터 API 오류:', errorText)
        throw new Error(`샘플 데이터 추가에 실패했습니다. (${res.status})`)
      }

      const message = await res.text()
      console.log('샘플 데이터 응답:', message)
      alert(message)
      // 게시판 목록 새로고침
      fetchBoards()
    } catch (err: any) {
      console.error('샘플 데이터 에러:', err)
      alert(err.message)
    }
  }

  async function handleLogout() {
    try {
      if (token) {
        const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (res.ok) {
          console.log('서버 로그아웃 성공')
        } else {
          console.log('서버 로그아웃 실패:', res.status)
        }
      }
    } catch (err) {
      console.error('로그아웃 API 호출 중 오류:', err)
    } finally {
      // 클라이언트 로그아웃 처리
      logout()
      navigate('/')
    }
  }

  if (loading) return <div style={{textAlign: 'center', marginTop: 40}}>로딩 중...</div>
  if (error) return <div style={{textAlign: 'center', marginTop: 40, color: 'red'}}>{error}</div>

  return (
      <div style={{maxWidth: 800, margin: '40px auto', fontFamily: 'system-ui, -apple-system'}}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <h2>게시판 목록</h2>
          <div style={{display: 'flex', gap: 10}}>
            <button
                onClick={addSampleData}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
            >
              샘플 데이터 추가
            </button>
            <Link to="/boards/new" style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}>
              새 글 작성
            </Link>
            <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
            >
              로그아웃
            </button>
          </div>
        </div>

        {boards.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666'}}>게시글이 없습니다.</p>
        ) : (
            <div style={{display: 'grid', gap: 16}}>
              {boards.map(board => (
                  <div key={board.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{flex: 1}}>
                        <h3 style={{margin: '0 0 8px 0', fontSize: '18px'}}>
                          <Link to={`/boards/${board.uuid}`}
                                style={{color: '#333', textDecoration: 'none'}}>
                            {board.title}
                          </Link>
                        </h3>
                        <p style={{margin: '0 0 8px 0', color: '#666', fontSize: '14px'}}>
                          {board.content.length > 100 ? `${board.content.substring(0, 100)}...` : board.content}
                        </p>
                        <div style={{display: 'flex', gap: 16, fontSize: '12px', color: '#999'}}>
                          <span>작성자: {board.author}</span>
                          <span>작성일: {new Date(board.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}

        <div style={{marginTop: 20, textAlign: 'center'}}>
          <Link to="/" style={{color: '#007bff', textDecoration: 'none'}}>홈으로 돌아가기</Link>
        </div>
      </div>
  )
}
