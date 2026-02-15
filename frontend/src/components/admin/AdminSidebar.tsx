import { NavLink } from 'react-router-dom'
import {
  FiHome,
  FiPackage,
  FiGrid,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiLayout,
  FiMail,
  FiHelpCircle,
  FiUser,
  FiX,
  FiTruck,
  FiBox,
  FiDollarSign,
  FiTag,
  FiPercent,
  FiCalendar,
} from 'react-icons/fi'

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: FiPackage },
  { to: '/admin/categorias', label: 'Categorias', icon: FiGrid },
  { to: '/admin/pedidos', label: 'Pedidos', icon: FiShoppingBag },
  { to: '/admin/clientes', label: 'Clientes', icon: FiUsers },
  { to: '/admin/estoque', label: 'Estoque', icon: FiTruck },
  { to: '/admin/fornecedores', label: 'Fornecedores', icon: FiBox },
  { to: '/admin/financeiro', label: 'Financeiro', icon: FiDollarSign },
  { to: '/admin/marketing', label: 'Marketing', icon: FiTag },
  { to: '/admin/cupons', label: 'Cupons', icon: FiPercent },
  { to: '/admin/campanhas', label: 'Campanhas', icon: FiCalendar },
  { to: '/admin/mensagens', label: 'Mensagens', icon: FiMail },
  { to: '/admin/home', label: 'Home Page', icon: FiLayout },
  { to: '/admin/faqs', label: 'FAQs', icon: FiHelpCircle },
  { to: '/admin/configuracoes', label: 'Configurações', icon: FiSettings },
  { to: '/admin/perfil', label: 'Perfil', icon: FiUser },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-navy flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo area */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="text-white text-lg font-semibold">Embeleze</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-gray-300 hover:text-white rounded"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {link.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom branding */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-gray-400">Floricultura Embeleze</p>
        <p className="text-xs text-gray-500">Painel Administrativo</p>
      </div>
    </aside>
  )
}
