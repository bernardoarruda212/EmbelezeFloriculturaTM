import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = (): (number | '...')[] => {
    const pages: (number | '...')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)

    if (currentPage > 3) {
      pages.push('...')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('...')
    }

    pages.push(totalPages)

    return pages
  }

  const pages = getVisiblePages()

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Paginacao">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-full text-text-medium hover:bg-brand-bg hover:text-brand-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
        aria-label="Pagina anterior"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-text-light">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
              page === currentPage
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-text-medium hover:bg-brand-bg hover:text-brand-blue'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 rounded-full text-text-medium hover:bg-brand-bg hover:text-brand-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
        aria-label="Proxima pagina"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </nav>
  )
}
