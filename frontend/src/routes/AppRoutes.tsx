import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { StoreSettingsProvider } from '../contexts/StoreSettingsContext'
import ProtectedRoute from './ProtectedRoute'

// Public pages
const HomePage = lazy(() => import('../pages/public/HomePage'))
const ProductsPage = lazy(() => import('../pages/public/ProductsPage'))
const ProductDetailPage = lazy(() => import('../pages/public/ProductDetailPage'))
const AboutPage = lazy(() => import('../pages/public/AboutPage'))
const ContactPage = lazy(() => import('../pages/public/ContactPage'))
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'))

// Admin pages
const LoginPage = lazy(() => import('../pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'))
const ProductsListPage = lazy(() => import('../pages/admin/ProductsListPage'))
const ProductFormPage = lazy(() => import('../pages/admin/ProductFormPage'))
const CategoriesPage = lazy(() => import('../pages/admin/CategoriesPage'))
const OrdersListPage = lazy(() => import('../pages/admin/OrdersListPage'))
const OrderDetailPage = lazy(() => import('../pages/admin/OrderDetailPage'))
const StoreSettingsPage = lazy(() => import('../pages/admin/StoreSettingsPage'))
const HomePageCustomizationPage = lazy(() => import('../pages/admin/HomePageCustomizationPage'))
const ContactMessagesPage = lazy(() => import('../pages/admin/ContactMessagesPage'))
const FaqsPage = lazy(() => import('../pages/admin/FaqsPage'))
const ProfilePage = lazy(() => import('../pages/admin/ProfilePage'))
const CustomersPage = lazy(() => import('../pages/admin/CustomersPage'))
const CustomerDetailPage = lazy(() => import('../pages/admin/CustomerDetailPage'))
const InventoryPage = lazy(() => import('../pages/admin/InventoryPage'))
const SuppliersPage = lazy(() => import('../pages/admin/SuppliersPage'))
const FinancialPage = lazy(() => import('../pages/admin/FinancialPage'))
const MarketingPage = lazy(() => import('../pages/admin/MarketingPage'))
const CouponsPage = lazy(() => import('../pages/admin/CouponsPage'))
const CampaignsPage = lazy(() => import('../pages/admin/CampaignsPage'))

// Layouts
const PublicLayout = lazy(() => import('../components/common/PublicLayout'))
const AdminLayout = lazy(() => import('../components/admin/AdminLayout'))

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue" />
  </div>
)

export default function AppRoutes() {
  return (
    <AuthProvider>
      <StoreSettingsProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/produtos/:slug" element={<ProductDetailPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/contato" element={<ContactPage />} />
            </Route>

            {/* Admin login */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected admin routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/produtos" element={<ProductsListPage />} />
                <Route path="/admin/produtos/novo" element={<ProductFormPage />} />
                <Route path="/admin/produtos/:id/editar" element={<ProductFormPage />} />
                <Route path="/admin/categorias" element={<CategoriesPage />} />
                <Route path="/admin/pedidos" element={<OrdersListPage />} />
                <Route path="/admin/pedidos/:id" element={<OrderDetailPage />} />
                <Route path="/admin/clientes" element={<CustomersPage />} />
                <Route path="/admin/clientes/:id" element={<CustomerDetailPage />} />
                <Route path="/admin/estoque" element={<InventoryPage />} />
                <Route path="/admin/fornecedores" element={<SuppliersPage />} />
                <Route path="/admin/financeiro" element={<FinancialPage />} />
                <Route path="/admin/marketing" element={<MarketingPage />} />
                <Route path="/admin/cupons" element={<CouponsPage />} />
                <Route path="/admin/campanhas" element={<CampaignsPage />} />
                <Route path="/admin/configuracoes" element={<StoreSettingsPage />} />
                <Route path="/admin/home" element={<HomePageCustomizationPage />} />
                <Route path="/admin/mensagens" element={<ContactMessagesPage />} />
                <Route path="/admin/faqs" element={<FaqsPage />} />
                <Route path="/admin/perfil" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </StoreSettingsProvider>
    </AuthProvider>
  )
}
