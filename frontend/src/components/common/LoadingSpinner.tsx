interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-12 w-12 border-3',
  lg: 'h-16 w-16 border-4',
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`animate-spin rounded-full border-brand-blue border-t-transparent ${sizeClasses[size]}`}
      />
      {message && (
        <p className="mt-4 text-sm text-text-medium">{message}</p>
      )}
    </div>
  )
}
