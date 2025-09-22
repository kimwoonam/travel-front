import React from 'react'
import {createRoot} from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import IndexPage from './pages/IndexPage'
import SignupPage from './pages/auth/SignupPage'
import LoginPage from './pages/auth/LoginPage'
import DeletePage from './pages/auth/DeletePage'
import BoardListPage from './pages/board/BoardListPage'
import BoardWritePage from './pages/board/BoardWritePage'
import BoardDetailPage from './pages/board/BoardDetailPage'
import BoardEditPage from './pages/board/BoardEditPage'
import AuthProvider from './contexts/AuthContext'

const router = createBrowserRouter([
  {path: '/', element: <IndexPage/>},
  {path: '/signup', element: <SignupPage/>},
  {path: '/login', element: <LoginPage/>},
  {path: '/delete', element: <DeletePage/>},
  {path: '/board', element: <BoardListPage/>},
  {path: '/board/new', element: <BoardWritePage/>},
  {path: '/board/:uuid', element: <BoardDetailPage/>},
  {path: '/board/:uuid/edit', element: <BoardEditPage/>},
])

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router}/>
      </AuthProvider>
    </React.StrictMode>
)
