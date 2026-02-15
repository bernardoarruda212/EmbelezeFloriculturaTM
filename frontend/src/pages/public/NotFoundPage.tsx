import { Link } from 'react-router-dom'
import { FiHome, FiShoppingBag } from 'react-icons/fi'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-brand-bg">
      {/* Decorative flower */}
      <div className="mb-6">
        <span className="text-8xl">🌺</span>
      </div>

      <h1 className="text-7xl md:text-8xl font-extrabold text-brand-pink mb-4">404</h1>

      <h2 className="text-2xl md:text-3xl font-bold text-text-dark mb-3">
        Pagina nao encontrada
      </h2>

      <p className="text-text-medium max-w-md mb-8">
        A pagina que voce esta procurando nao existe ou foi removida.
        Que tal explorar nossos produtos?
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-navy text-white font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        >
          <FiHome className="w-4 h-4" />
          Voltar ao Inicio
        </Link>
        <Link
          to="/produtos"
          className="inline-flex items-center gap-2 bg-white text-brand-blue font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg border border-brand-blue/20 hover:border-brand-blue transition-all duration-300"
        >
          <FiShoppingBag className="w-4 h-4" />
          Ver Produtos
        </Link>
      </div>
    </div>
  )
}
