export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  stockQuantity: number
  isFeatured: boolean
  isActive: boolean
  badge: string | null
  mainImageUrl: string | null
  categoryNames: string[]
  createdAt: string
  updatedAt: string | null
}

export interface ProductDetail extends Product {
  images: ProductImage[]
  variations: ProductVariation[]
  categories: CategoryRef[]
}

export interface ProductImage {
  id: string
  imageUrl: string
  displayOrder: number
  isMain: boolean
}

export interface ProductVariation {
  id: string
  name: string
  price: number
  stockQuantity: number
  isActive: boolean
}

export interface CategoryRef {
  id: string
  name: string
  slug: string
}

export interface ProductCreate {
  name: string
  description: string | null
  basePrice: number
  stockQuantity: number
  isFeatured: boolean
  isActive: boolean
  badge: string | null
  categoryIds: string[]
  variations: ProductVariationCreate[]
}

export interface ProductVariationCreate {
  name: string
  price: number
  stockQuantity: number
}

export interface ProductFilter {
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  page?: number
  pageSize?: number
  isActive?: boolean
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
