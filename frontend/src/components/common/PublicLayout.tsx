import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import WhatsAppFloat from './WhatsAppFloat'
import ScrollToTop from './ScrollToTop'

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <ScrollToTop />
      <WhatsAppFloat />
      <Footer />
    </div>
  )
}
