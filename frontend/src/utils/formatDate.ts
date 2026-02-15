import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR })
}

export function formatDateTime(dateString: string): string {
  return format(parseISO(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}
