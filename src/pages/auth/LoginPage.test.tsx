import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import AuthProvider from '../../contexts/AuthContext'

// Mock fetch
global.fetch = vi.fn()

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('로그인 폼이 렌더링된다', () => {
    renderLoginPage()
    
    expect(screen.getByText('로그인')).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('로그인 성공 시 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    
    // Mock successful login response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'test-token',
        email: 'test@example.com',
        name: '테스트'
      })
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'Password123!')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByText('로그인 성공!')).toBeInTheDocument()
    })
  })

  it('로그인 실패 시 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    
    // Mock failed login response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Invalid credentials'
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('이메일과 비밀번호 입력 필드가 필수이다', () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('폼 제출 시 올바른 API 엔드포인트로 요청이 전송된다', async () => {
    const user = userEvent.setup()
    
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'test-token',
        email: 'test@example.com',
        name: '테스트'
      })
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'Password123!')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Password123!'
          })
        })
      )
    })
  })
})




