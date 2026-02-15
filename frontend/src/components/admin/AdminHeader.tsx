import { FiMenu, FiLogOut } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AdminHeaderProps {
  onMenuToggle: () => void
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-md text-text-medium hover:bg-gray-100"
        aria-label="Abrir menu"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-text-medium hidden sm:inline">
          {user?.fullName ?? 'Administrador'}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-text-medium hover:text-brand-pink transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  )
}
