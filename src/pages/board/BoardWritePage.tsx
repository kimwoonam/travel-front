import {FormEvent, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../contexts/AuthContext'

export default function BoardWritePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [nickName, setNickName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const {isLoggedIn, token} = useAuth()
  const [files, setFiles] = useState<File[]>([]) // 파일을 저장할 state

  useEffect(() => {
    // 로그인되지 않은 사용자가 접근하면 홈페이지로 리다이렉트
    if (!isLoggedIn) {
      navigate('/')
    }
  }, [isLoggedIn, navigate])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const uniqueFiles: File[] = []
      const existingFileIdentifiers = new Set(files.map(file => `${file.name}-${file.size}-${file.lastModified}`))

      selectedFiles.forEach(file => {
        const fileIdentifier = `${file.name}-${file.size}-${file.lastModified}`
        if (!existingFileIdentifiers.has(fileIdentifier)) {
          uniqueFiles.push(file)
          existingFileIdentifiers.add(fileIdentifier)
        } else {
          setMessage(`'${file.name}' 파일은 이미 선택되었습니다.`)
        }
      })

      setFiles(prevFiles => [...prevFiles, ...uniqueFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !nickName.trim()) {
      setMessage('모든 필드를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    // FormData 객체를 생성하여 데이터를 담습니다.
    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('nickName', nickName)
    if (files) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8080'}/api/board`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || '게시글 작성에 실패했습니다.')
      }

      setMessage('게시글이 성공적으로 작성되었습니다!')
      setTimeout(() => {
        navigate('/board')
      }, 1500)
    } catch (err: any) {
      setMessage(err.message || '에러가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div style={{maxWidth: 800, margin: '40px auto', fontFamily: 'system-ui, -apple-system'}}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30
        }}>
          <h2>새 게시글 작성</h2>
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
            목록으로 돌아가기
          </button>
        </div>

        <form onSubmit={onSubmit} style={{display: 'grid', gap: 20}}>
          <div>
            <label style={{display: 'block', marginBottom: 8, fontWeight: 'bold'}}>
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
            <label style={{display: 'block', marginBottom: 8, fontWeight: 'bold'}}>
              작성자 *
            </label>
            <input
                type="text"
                value={nickName}
                onChange={e => setNickName(e.target.value)}
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
            <label style={{display: 'block', marginBottom: 8, fontWeight: 'bold'}}>
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

          {/* 파일 업로드 input 추가 */}
          <div>
            <label style={{display: 'block', marginBottom: 8, fontWeight: 'bold'}}>
              파일 첨부 (선택)
            </label>
            <input
                type="file"
                multiple
                onChange={handleFileChange}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = '';
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
            />
            {files.length > 0 && (
                <div style={{ marginTop: 15, border: '1px solid #e0e0e0', borderRadius: '4px', padding: 15 }}>
                  <p style={{ fontWeight: 'bold', marginBottom: 10 }}>선택된 파일 ({files.length}개)</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {files.map((file, index) => (
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
                              onClick={() => handleRemoveFile(index)}
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

          <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
            <button
                type="button"
                onClick={() => navigate('/board')}
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
                  backgroundColor: isSubmitting ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
            >
              {isSubmitting ? '작성 중...' : '게시글 작성'}
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
