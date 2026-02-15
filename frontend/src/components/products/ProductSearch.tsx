import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'

interface ProductSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export default function ProductSearch({
  value,
  onChange,
  placeholder = 'Buscar produtos...',
  debounceMs = 400,
}: ProductSearchProps) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(newValue)
    }, debounceMs)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className="relative w-full max-w-md">
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-full text-sm text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300 shadow-sm"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark transition-colors"
          aria-label="Limpar busca"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
