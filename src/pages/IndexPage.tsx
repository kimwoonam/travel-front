import {Link, useNavigate} from 'react-router-dom'
import {useEffect} from 'react'
import {useAuth} from '../contexts/AuthContext'

export default function IndexPage() {
  const navigate = useNavigate()
  const {isLoggedIn} = useAuth()

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/board')
    }
  }, [navigate, isLoggedIn])

  return (
      <div style={{maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui, -apple-system'}}>
        <h1>여행 소개</h1>
        <p>간단한 여행 소개 페이지입니다. 회원가입하고 로그인해보세요.</p>
        <nav style={{display: 'flex', gap: 12, marginTop: 24}}>
          <Link to="/signup">회원가입</Link>
          <Link to="/login">로그인</Link>
          <Link to="/delete">회원탈퇴</Link>
        </nav>
      </div>
  )
}
