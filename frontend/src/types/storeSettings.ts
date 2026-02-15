export interface StoreSettings {
  id: string
  businessName: string
  whatsAppNumber: string
  phoneNumber: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  aboutContent: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  googleMapsEmbedUrl: string | null
  businessHours: BusinessHours[]
}

export interface BusinessHours {
  day: string
  hours: string
}
