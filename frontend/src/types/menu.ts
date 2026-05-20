export interface MenuItem {
  id: string
  name: string
  description: string
  default_price: number
  category: string
  image: string
  is_active: boolean
  collectionId: string
  collectionName: string
}

export interface SessionItem {
  id: string
  preorder_session: string
  menu_item: string
  price: number
  is_available: boolean
  expand?: {
    menu_item?: MenuItem
  }
}
