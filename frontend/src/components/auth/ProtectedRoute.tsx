import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'

export const ProtectedRoute = () => {
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth)
  const token = localStorage.getItem('token')

  const isAuthenticated = (isLoggedIn || Boolean(user)) && Boolean(token)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
