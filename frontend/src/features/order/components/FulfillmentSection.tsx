import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'
import type { Session, CustomLocation } from '@/types/session'
import { cn } from '@/lib/utils/cn'

interface Props {
  form: UseFormReturn<OrderFormValues>
  session: Session
}

export function FulfillmentSection({ form, session }: Props) {
  const { register, watch, formState: { errors } } = form
  const fulfillmentType = watch('fulfillment_type')

  const options = [
    { value: 'pickup' as const, label: '🛍 Self Pickup', enabled: session.allow_pickup },
    { value: 'delivery' as const, label: '🚚 Delivery (additional fee)', enabled: session.allow_delivery },
    { value: 'custom' as const, label: '📍 Drop-off Point', enabled: (session.custom_locations ?? []).length > 0 },
  ].filter(o => o.enabled)

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-stone-800 mb-3">Fulfillment</h2>
      <div className="bg-white rounded-2xl shadow-sm px-4 py-4 space-y-3">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
            <input {...register('fulfillment_type')} type="radio" value={opt.value} className="accent-amber-500" />
            <span className="text-sm text-stone-700">{opt.label}</span>
          </label>
        ))}
        {fulfillmentType === 'delivery' && (
          <div className="pt-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Delivery Address</label>
            <textarea
              {...register('delivery_address')}
              rows={3}
              placeholder="Full address including RT/RW, kelurahan, etc."
              className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none', errors.delivery_address ? 'border-red-400' : 'border-stone-300')}
            />
            {errors.delivery_address && <p className="text-red-500 text-xs mt-1">{errors.delivery_address.message}</p>}
          </div>
        )}
        {fulfillmentType === 'custom' && (
          <div className="pt-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Select Drop-off Location</label>
            <select
              {...register('custom_location')}
              className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.custom_location ? 'border-red-400' : 'border-stone-300')}
            >
              <option value="">— Choose location —</option>
              {(session.custom_locations as CustomLocation[]).map((loc) => (
                <option key={loc.name} value={loc.name}>{loc.name} — {loc.time}</option>
              ))}
            </select>
            {errors.custom_location && <p className="text-red-500 text-xs mt-1">{errors.custom_location.message}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
