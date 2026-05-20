export type FulfillmentType = 'pickup' | 'delivery' | 'custom'

export interface Order {
  id: string
  preorder_session: string
  customer_name: string
  whatsapp: string
  fulfillment_type: FulfillmentType
  delivery_address: string
  custom_location: string
  notes: string
  is_fulfilled: boolean
  expand?: {
    'order_items(order)'?: OrderItem[]
  }
}

export interface OrderItem {
  id: string
  order: string
  preorder_session_item: string
  quantity: number
  expand?: {
    preorder_session_item?: import('./menu').SessionItem
  }
}

export interface OrderItemFormValue {
  session_item_id: string
  quantity: number
}

export interface OrderFormValues {
  customer_name: string
  whatsapp: string
  fulfillment_type: FulfillmentType
  delivery_address: string
  custom_location: string
  notes: string
  items: OrderItemFormValue[]
}
