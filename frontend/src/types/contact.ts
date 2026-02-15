export interface ContactMessage {
  id: string
  name: string
  phone: string | null
  email: string | null
  subject: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export interface ContactMessageCreate {
  name: string
  phone?: string
  email?: string
  subject?: string
  message: string
}

export interface Faq {
  id: string
  question: string
  answer: string
  displayOrder: number
  isActive: boolean
}
