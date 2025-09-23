import { FormEvent, useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
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

export default function BoardEditPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const { isLoggedIn, token } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [nickName, setNickName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 파일관련
  const [newFiles, setNewFiles] = useState<File[]>([]) // 파일을 저장할 state
  const [existingFiles, setExistingFiles] = useState<CommonFile[]>([]) // 기존 파일 목록
  const [filesToDelete, setFilesToDelete] = useState<string[]>([])    // 삭제할 파일 uuid 목록
  const quillRef = useRef<ReactQuill>(null); // Quill 인스턴스에 접근하기 위한 ref

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
        if (res.status === 404) throw new Error('게시글을 찾을 수 없습니다.')
        throw new Error('게시글을 불러올 수 없습니다.')
      }
      const data = await res.json()
      setBoard(data.board)
      setTitle(data.board.title)
      setContent(data.board.content)
      setNickName(data.board.nickName)
      if (data.files) { // 백엔드에서 files 배열을 보내주면 state에 저장
        setExistingFiles(data.files)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const uniqueFiles: File[] = []
      const existingFileIdentifiers = new Set(newFiles.map(file => `${file.name}-${file.size}-${file.lastModified}`))

      selectedFiles.forEach(file => {
        const fileIdentifier = `${file.name}-${file.size}-${file.lastModified}`
        if (!existingFileIdentifiers.has(fileIdentifier)) {
          uniqueFiles.push(file)
          existingFileIdentifiers.add(fileIdentifier)
        } else {
          setMessage(`'${file.name}' 파일은 이미 선택되었습니다.`)
        }
      })

      setNewFiles(prevFiles => [...prevFiles, ...uniqueFiles])
    }
  }

  const handleRemoveNewFile = (index: number) => {
    setNewFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // 기존 파일 삭제 체크박스 핸들러를 추가합니다.
  const handleDeleteFileChange = (fileUuid: string) => {
    setFilesToDelete(prev =>
        prev.includes(fileUuid)
            ? prev.filter(uuid => uuid !== fileUuid) // 이미 있으면 제거 (체크 해제)
            : [...prev, fileUuid]                     // 없으면 추가 (체크)
    );
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !nickName.trim()) {
      setMessage('모든 필드를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('nickName', nickName)
    formData.append('deleteFileId', filesToDelete.toString())
    if (newFiles) {
      newFiles.forEach(file => {
        formData.append('files', file);
      });
    }

    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/board/${uuid}`, {
        method: 'PUT',
        headers,
        body: formData
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || '게시글 수정에 실패했습니다.')
      }

      setMessage('게시글이 성공적으로 수정되었습니다!')
      setTimeout(() => {
        navigate(`/board/${uuid}`)
      }, 1500)
    } catch (err: any) {
      setMessage(err.message || '에러가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quill 에디터 툴바 옵션 설정
  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>로딩 중...</div>
  if (error) return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'system-ui, -apple-system' }}>
      <div style={{ textAlign: 'center', color: 'red', marginBottom: 20 }}>{error}</div>
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/board')}
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
          onClick={() => navigate(`/board/${uuid}`)}
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

        {/* 기존 파일 목록 및 삭제 UI */}
        {existingFiles.length > 0 && (
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>기존 첨부 파일</label>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: 15 }}>
                {existingFiles.map(file => (
                    <div key={file.uuid} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                          type="checkbox"
                          id={`delete-${file.uuid}`}
                          checked={filesToDelete.includes(file.uuid)}
                          onChange={() => handleDeleteFileChange(file.uuid)}
                          style={{ marginRight: '10px', width: '16px', height: '16px' }}
                      />
                      <label htmlFor={`delete-${file.uuid}`} style={{ fontSize: '14px', cursor: 'pointer', textDecoration: filesToDelete.includes(file.uuid) ? 'line-through' : 'none', color: filesToDelete.includes(file.uuid) ? '#888' : 'inherit' }}>
                        <a
                            href={`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/file/${token},${file.uuid}`}
                            target="_blank" // 새 탭에서 링크를 엽니다.
                            rel="noopener noreferrer" // 보안을 위한 속성입니다.
                            onClick={(e) => e.stopPropagation()} // 링크 클릭 시 라벨의 체크박스 동작을 막습니다.
                            style={{ color: '#007bff', textDecoration: 'underline', marginRight: '5px' }}
                        >
                        {file.originalFileName} (삭제하려면 체크)
                        </a>
                      </label>
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* 파일 업로드 input 추가 */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            파일 첨부 (선택)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label
                htmlFor="file-upload"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  textAlign: 'center'
                }}
            >
              파일 선택
            </label>
            {newFiles.length > 0 && (
                <span style={{ fontSize: '16px', color: '#555' }}>
                    파일 {newFiles.length}개
                  </span>
            )}
          </div>
          <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleNewFileChange}
              onClick={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = '';
              }}
              style={{
                display: 'none',
              }}
          />
          {newFiles.length > 0 && (
              <div style={{ marginTop: 15, border: '1px solid #e0e0e0', borderRadius: '4px', padding: 15 }}>
                <p style={{ fontWeight: 'bold', marginBottom: 10 }}>선택된 파일 ({newFiles.length}개)</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {newFiles.map((file, index) => (
                      <li key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px',
                        marginBottom: '5px',
                        fontSize: '14px'
                      }}>
                        <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
                        <button
                            type="button"
                            onClick={() => handleRemoveNewFile(index)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#dc3545',
                              cursor: 'pointer',
                              fontSize: '18px',
                              lineHeight: '1'
                            }}
                        >
                          &times;
                        </button>
                      </li>
                  ))}
                </ul>
              </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            작성자
          </label>
          <input 
            type="text" 
            value={nickName}
            onChange={e => setNickName(e.target.value)}
            required
            readOnly={true}
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
          <ReactQuill
              ref={quillRef} // ref 연결
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              style={{ height: '300px', marginBottom: '50px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button 
            type="button"
            onClick={() => navigate(`/board/${uuid}`)}
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
