export enum DiscountType {
  Percentage = 0,
  FixedValue = 1,
}

export const DiscountTypeLabels: Record<DiscountType, string> = {
  [DiscountType.Percentage]: 'Percentual',
  [DiscountType.FixedValue]: 'Valor Fixo',
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number | null
  maxUses: number | null
  currentUses: number
  expiresAt: string | null
  isActive: boolean
  campaignName: string | null
  createdAt: string
}

export interface CouponCreate {
  code: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount?: number
  maxUses?: number
  expiresAt?: string
  isActive: boolean
  campaignId?: string
}

export interface CouponValidation {
  code: string
  orderTotal: number
}

export interface CouponValidationResult {
  isValid: boolean
  errorMessage: string | null
  couponId: string | null
  discountType: DiscountType | null
  discountValue: number
  discountAmount: number
}

export interface Campaign {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  isActive: boolean
  couponCount: number
  promotionCount: number
  createdAt: string
}

export interface CampaignCreate {
  name: string
  description?: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface ProductPromotion {
  id: string
  productId: string
  productName: string
  originalPrice: number
  promotionalPrice: number
  discountPercentage: number
  startDate: string
  endDate: string
  isActive: boolean
  campaignName: string | null
  createdAt: string
}

export interface ProductPromotionCreate {
  productId: string
  campaignId?: string
  promotionalPrice: number
  startDate: string
  endDate: string
  isActive: boolean
}
