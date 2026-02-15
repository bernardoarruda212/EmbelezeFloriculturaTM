export enum HomePageSectionType {
  Hero = 0,
  Diferenciais = 1,
  FeaturedProducts = 2,
  Promotions = 3,
  Instagram = 4,
  ContactInfo = 5,
  CTA = 6,
  Banners = 7,
}

export interface HomePageSection {
  id: string
  sectionType: HomePageSectionType
  title: string | null
  subtitle: string | null
  contentJson: string | null
  displayOrder: number
  isVisible: boolean
}

export interface Banner {
  id: string
  homePageSectionId: string
  imageUrl: string
  linkUrl: string | null
  title: string | null
  description: string | null
  displayOrder: number
  isActive: boolean
}
