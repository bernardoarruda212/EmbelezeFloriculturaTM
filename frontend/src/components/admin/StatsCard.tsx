import type { IconType } from 'react-icons'

interface StatsCardProps {
  label: string
  value: string | number
  icon: IconType
  colorClass: string
}

export default function StatsCard({ label, value, icon: Icon, colorClass }: StatsCardProps) {
  return (
    <div className="card-top-accent bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-dark">{value}</p>
        <p className="text-sm text-text-light">{label}</p>
      </div>
    </div>
  )
}
