import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider, { useAuth } from './AuthContext'
import Cookies from 'js-cookie'

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn()
  }
}))

const TestComponent = () => {
  const { isLoggedIn, token, email, name, login, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="isLoggedIn">{isLoggedIn ? 'true' : 'false'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="email">{email || 'null'}</div>
      <div data-testid="name">{name || 'null'}</div>
      <button onClick={() => login('test-token', 'test@example.com', '테스트')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(Cookies.get as any).mockReturnValue(null)
  })

  it('초기 상태는 로그아웃 상태이다', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('false')
    expect(screen.getByTestId('token')).toHaveTextContent('null')
  })

  it('쿠키에 토큰이 있으면 로그인 상태로 초기화된다', () => {
    ;(Cookies.get as any).mockReturnValue('existing-token')

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('true')
  })

  it('login 함수가 상태를 업데이트한다', async () => {
    const { user } = await import('@testing-library/user-event')
    const userEvent = user.setup()

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )

    await userEvent.click(screen.getByText('Login'))

    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('true')
    expect(screen.getByTestId('token')).toHaveTextContent('test-token')
    expect(screen.getByTestId('email')).toHaveTextContent('test@example.com')
    expect(screen.getByTestId('name')).toHaveTextContent('테스트')
  })

  it('logout 함수가 상태를 초기화한다', async () => {
    const { user } = await import('@testing-library/user-event')
    const userEvent = user.setup()

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )

    // 먼저 로그인
    await userEvent.click(screen.getByText('Login'))
    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('true')

    // 로그아웃
    await userEvent.click(screen.getByText('Logout'))
    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('false')
    expect(screen.getByTestId('token')).toHaveTextContent('null')
  })
})
