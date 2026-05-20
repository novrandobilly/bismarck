import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import type { SessionItem } from '@/types/menu'
import type { OrderFormValues } from '@/types/order'
import type { Session } from '@/types/session'
import type { FulfillmentType } from '@/types/order'

const schema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  whatsapp: z.string().min(5, 'WhatsApp number is required'),
  fulfillment_type: z.enum(['pickup', 'delivery', 'custom']),
  delivery_address: z.string().default(''),
  custom_location: z.string().default(''),
  notes: z.string().default(''),
  items: z.array(z.object({
    session_item_id: z.string(),
    quantity: z.number().int().min(0),
  })),
}).superRefine((val, ctx) => {
  if (val.fulfillment_type === 'delivery' && !val.delivery_address) {
    ctx.addIssue({ code: 'custom', path: ['delivery_address'], message: 'Delivery address is required' })
  }
  if (val.fulfillment_type === 'custom' && !val.custom_location) {
    ctx.addIssue({ code: 'custom', path: ['custom_location'], message: 'Please select a drop-off location' })
  }
  if (!val.items.some(i => i.quantity > 0)) {
    ctx.addIssue({ code: 'custom', path: ['items'], message: 'Please add at least one item to your order' })
  }
})

export function useOrderForm(sessionItems: SessionItem[], session: Session | null) {
  const defaultFulfillment: FulfillmentType =
    session?.allow_pickup ? 'pickup'
    : session?.allow_delivery ? 'delivery'
    : 'custom'

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(schema) as Resolver<OrderFormValues>,
    defaultValues: {
      customer_name: '',
      whatsapp: '',
      fulfillment_type: defaultFulfillment,
      delivery_address: '',
      custom_location: '',
      notes: '',
      items: [],
    },
  })

  useEffect(() => {
    if (sessionItems.length > 0 && form.getValues('items').length === 0) {
      form.setValue('items', sessionItems.map(si => ({ session_item_id: si.id, quantity: 0 })))
    }
  }, [sessionItems, form])

  return form
}
