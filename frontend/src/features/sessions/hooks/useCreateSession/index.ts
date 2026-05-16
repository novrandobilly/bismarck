import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Session } from '@/types/session'

export interface SessionFormValues {
  title: string
  description: string
  fulfillment_date: string
  order_deadline: string
  max_orders: number
  allow_pickup: boolean
  allow_delivery: boolean
  custom_locations: { name: string; time: string }[]
  selectedItems: { menu_item_id: string; price: number; is_available: boolean }[]
}

async function createSession(values: SessionFormValues): Promise<Session> {
  const session = await pb.collection('sessions').create<Session>({
    title: values.title,
    description: values.description,
    fulfillment_date: values.fulfillment_date,
    order_deadline: values.order_deadline,
    max_orders: values.max_orders,
    status: 'open',
    allow_pickup: values.allow_pickup,
    allow_delivery: values.allow_delivery,
    custom_locations: values.custom_locations,
  })

  await Promise.all(
    values.selectedItems.map(item =>
      pb.collection('session_items').create({
        session: session.id,
        menu_item: item.menu_item_id,
        price: item.price,
        is_available: item.is_available,
      }),
    ),
  )

  return session
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })
}
