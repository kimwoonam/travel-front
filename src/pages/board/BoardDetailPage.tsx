import {useEffect, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../../contexts/AuthContext'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Board {
  id: number
  uuid: string
  title: string
  content: string
  nickName: string
  createdAt: string
  files: CommonFile[]
}

// Board 인터페이스 위에 추가해주세요.
interface CommonFile {
  uuid: string
  originalFileName: string
}


export default function BoardDetailPage() {
  const {uuid} = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const {isLoggedIn, token, logout} = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [file, setFile] = useState<CommonFile[]>([])

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

      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/board/${uuid}`, {
        headers
      })
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('게시글을 찾을 수 없습니다.')
        } else if (res.status === 401) {
          logout()
          navigate('/')
        }
        throw new Error('게시글을 불러올 수 없습니다.')
      }
      const data = await res.json()
      console.log('받은 데이터:', data)
      setBoard(data.board)
      if (data.files) {
        setFile(data.files)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteBoard() {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    setIsDeleting(true)
    try {

      const headers: Record<string, string> = {'Content-Type': 'application/json'}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/board/${uuid}`, {
        method: 'DELETE',
        headers
      })

      if (!res.ok) {
        throw new Error('게시글 삭제에 실패했습니다.')
      }

      alert('게시글이 삭제되었습니다.')
      navigate('/board')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const modules = {
    toolbar: false
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 40}}>로딩 중...</div>
  if (error) return (
      <div style={{maxWidth: 800, margin: '40px auto', fontFamily: 'system-ui, -apple-system'}}>
        <div style={{textAlign: 'center', color: 'red', marginBottom: 20}}>{error}</div>
        <div style={{textAlign: 'center'}}>
          <Link to="/boards" style={{color: '#007bff', textDecoration: 'none'}}>게시판 목록으로 돌아가기</Link>
        </div>
      </div>
  )
  if (!board) return <div style={{textAlign: 'center', marginTop: 40}}>게시글을 찾을 수 없습니다.</div>

  return (
      <div style={{maxWidth: 800, margin: '40px auto', fontFamily: 'system-ui, -apple-system'}}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30
        }}>
          <h2>게시글 상세</h2>
          <div style={{display: 'flex', gap: 10}}>
            <Link to="/board/new" style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}>
              새 글 작성
            </Link>
            <button
                onClick={() => navigate('/board')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
            >
              목록으로
            </button>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: 'white',
          marginBottom: '20px'
        }}>
          {/* 제목 */}
          <h1 style={{
            margin: '0 0 16px 0',
            fontSize: '24px',
            color: '#333',
            borderBottom: '2px solid #007bff',
            paddingBottom: '12px'
          }}>
            {board.title}
          </h1>

          {/* 메타 정보 */}
          <div style={{
            display: 'flex',
            gap: 20,
            fontSize: '14px',
            color: '#666',
            marginBottom: '24px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <span>작성자: <strong>{board.nickName}</strong></span>
            <span>작성일: <strong>{new Date(board.createdAt).toLocaleString()}</strong></span>
          </div>

          {/* 내용 */}
          <div style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#333',
            whiteSpace: 'pre-wrap',
            minHeight: '200px'
          }}>
            <ReactQuill
                value={board.content}
                readOnly={true}
                theme="snow"
                modules={modules} // 툴바를 숨깁니다.
            />
          </div>

          {file.length > 0 && (
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>첨부 파일</label>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: 15 }}>
                  {file.map(file => (
                      <div key={file.uuid} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '14px', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                          <a
                              href={`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/file/${token},${file.uuid}`}
                              target="_blank" // 새 탭에서 링크를 엽니다.
                              rel="noopener noreferrer" // 보안을 위한 속성입니다.
                              onClick={(e) => e.stopPropagation()} // 링크 클릭 시 라벨의 체크박스 동작을 막습니다.
                              style={{ color: '#007bff', textDecoration: 'underline', marginRight: '5px' }}
                          >
                            {file.originalFileName}
                          </a>
                        </label>
                      </div>
                  ))}
                </div>
              </div>
          )}
        </div>


        {/* 액션 버튼 */}
        <div style={{display: 'flex', gap: 10, justifyContent: 'center'}}>
          <Link to={`/board/${board.uuid}/edit`} style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px'
          }}>
            수정하기
          </Link>
          <button
              onClick={deleteBoard}
              disabled={isDeleting}
              style={{
                padding: '12px 24px',
                backgroundColor: isDeleting ? '#ccc' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
          >
            {isDeleting ? '삭제 중...' : '삭제하기'}
          </button>
        </div>

        {/* 이전/다음 게시글 네비게이션 */}
        <div style={{
          marginTop: 40,
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{margin: '0 0 16px 0', color: '#666'}}>
            다른 게시글도 확인해보세요
          </p>
          <div style={{display: 'flex', gap: 10, justifyContent: 'center'}}>
            <Link to="/boards" style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}>
              게시판 목록
            </Link>
            <Link to="/board/new" style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}>
              새 글 작성
            </Link>
          </div>
        </div>
      </div>
  )
}
