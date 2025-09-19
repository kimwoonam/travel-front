import {useEffect, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../../contexts/AuthContext'

interface Board {
  id: number
  uuid: string
  title: string
  content: string
  nickName: string
  createdAt: string
}

export default function BoardListPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const {logout, token, isLoggedIn} = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedBoardsValues, setSelectedBoardsValues] = useState(new Set());

  useEffect(() => {
    if (isLoggedIn) {
      fetchBoards()
    } else {
      navigate('/login')
    }
  }, [])

  async function fetchBoards() {
    try {
      console.log('게시판 목록을 불러오는 중...')
      const headers: Record<string, string> = {'Content-Type': 'application/json'}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/boards`, {
        headers
      })

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          navigate('/')
          throw new Error(`게시판 목록을 불러올 수 없습니다. (${res.status})`)
        } else {
          const errorText = await res.text()
          console.error('API 오류:', errorText)
          throw new Error(`게시판 목록을 불러올 수 없습니다. (${res.status})`)
        }
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

      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/boards/init`, {
        method: 'POST',
        headers
      })

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

  const handleCheckboxChange = (e: any) => {
    const {value, checked} = e.target;

    // Set 객체는 중복을 자동으로 방지
    setSelectedBoardsValues(prevBoards => {
      const newBoards = new Set(prevBoards);
      if (checked) {
        newBoards.add(value);
      } else {
        newBoards.delete(value);
      }
      console.log(newBoards)
      return newBoards;
    });
  };

  async function deleteBoards() {
    // 버튼 클릭 시 Set 객체의 값을 배열로 변환하여 확인
    const selectedArray = Array.from(selectedBoardsValues);
    if (!confirm('정말로 게시글을 삭제하시겠습니까?')) {
      return
    }

    setIsDeleting(true)
    try {

      const headers: Record<string, string> = {'Content-Type': 'application/json'}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/boards/bulk/${selectedArray.join(',')}`, {
        method: 'DELETE',
        headers
      })

      if (res.status !== 204) {
        console.log('res.status: ', res.status)
        throw new Error('게시글 삭제에 실패했습니다.')
      }

      alert('게시글이 삭제되었습니다.')
      fetchBoards()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleLogout() {
    try {
      if (token) {
        const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (res.status === 204) {
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
                onClick={deleteBoards}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isDeleting ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
            >
              {isDeleting ? '삭제 중...' : '게시글 삭제하기'}
            </button>
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
                          <input type={"checkbox"}
                                 onChange={handleCheckboxChange}
                                 value={board.uuid}
                                 style={{marginRight: 10}}/>
                          <Link to={`/boards/${board.uuid}`}
                                style={{color: '#333', textDecoration: 'none'}}>
                            {board.title}
                          </Link>
                        </h3>
                        <p style={{margin: '0 0 8px 0', color: '#666', fontSize: '14px'}}>
                          {board.content.length > 100 ? `${board.content.substring(0, 100)}...` : board.content}
                        </p>
                        <div style={{display: 'flex', gap: 16, fontSize: '12px', color: '#999'}}>
                          <span>작성자: {board.nickName}</span>
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
