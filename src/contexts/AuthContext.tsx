import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// AuthContextType 인터페이스와 AuthContext를 컴포넌트 외부로 이동시킵니다.
// 이렇게 하면 Fast Refresh 시 매번 새로운 컨텍스트가 생성되는 것을 방지할 수 있습니다.
interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  userEmail: string | null;
  userDisplayName: string | null;
  login: (token: string, email: string, displayName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider를 기본 내보내기(default export)로 변경하여 import 오류를 수정합니다.
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 로그인 상태 확인
    const token = getItemWithExpiry('token');
    const savedEmail = localStorage.getItem('userEmail');
    const savedDisplayName = localStorage.getItem('userDisplayName');

    if (token) {
      setIsLoggedIn(true);
      setToken(token);
      setUserEmail(savedEmail);
      setUserDisplayName(savedDisplayName);
    } else {
      console.log('유효하지 않은 토큰입니다.');
      logout();
    }
  }, []);

  const login = (token: string, email: string, displayName: string) => {
    setIsLoggedIn(true);
    setToken(token);
    setUserEmail(email);
    setUserDisplayName(displayName);
    setItemWithExpiry(token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userDisplayName', displayName);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUserEmail(null);
    setUserDisplayName(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');
    localStorage.removeItem('isLoggedIn');
  };

  const setItemWithExpiry = (value: any) => {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + 3600 * 1000, // 만료 시간을 밀리초 단위로 계산하여 저장(초단위)
    };
    localStorage.setItem('token', JSON.stringify(item));
  };

  const getItemWithExpiry = (key: any) => {

    // 저장된 아이템이 없으면 null 반환
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    // 현재 시간이 만료 시간보다 크면(만료되었으면)
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  };

  return (
      <AuthContext.Provider value={{ isLoggedIn, token, userEmail, userDisplayName, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
}

// useAuth 훅도 export합니다.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}