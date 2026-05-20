import { useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { OrderFormValues } from '@/types/order'

interface SubmitOrderInput {
  sessionId: string
  values: OrderFormValues
}

async function submitOrder({ sessionId, values }: SubmitOrderInput): Promise<string> {
  const order = await pb.collection('orders').create({
    preorder_session: sessionId,
    customer_name: values.customer_name,
    whatsapp: values.whatsapp,
    fulfillment_type: values.fulfillment_type,
    delivery_address: values.delivery_address ?? '',
    custom_location: values.custom_location ?? '',
    notes: values.notes ?? '',
  })

  await Promise.all(
    values.items
      .filter(i => i.quantity > 0)
      .map(item =>
        pb.collection('order_items').create({
          order: order.id,
          preorder_session_item: item.session_item_id,
          quantity: item.quantity,
        }),
      ),
  )

  return order.id
}

export function useSubmitOrder() {
  return useMutation({ mutationFn: submitOrder })
}
