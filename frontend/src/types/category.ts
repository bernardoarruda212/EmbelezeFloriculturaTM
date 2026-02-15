export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  iconClass: string | null
  imageUrl: string | null
  displayOrder: number
  isActive: boolean
  productCount?: number
}

export interface CategoryCreate {
  name: string
  description: string | null
  iconClass: string | null
  displayOrder: number
  isActive: boolean
}
