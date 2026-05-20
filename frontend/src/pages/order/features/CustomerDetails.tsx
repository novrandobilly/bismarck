import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'
import { cn } from '@/lib/utils/cn'

interface Props { form: UseFormReturn<OrderFormValues> }

export function CustomerDetails({ form }: Props) {
  const { register, formState: { errors } } = form
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-stone-800 mb-3">Your Details</h2>
      <div className="bg-white rounded-2xl shadow-sm px-4 py-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
          <input
            {...register('customer_name')}
            type="text"
            placeholder="Your full name"
            className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.customer_name ? 'border-red-400' : 'border-stone-300')}
          />
          {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp Number</label>
          <input
            {...register('whatsapp')}
            type="tel"
            placeholder="e.g. 08123456789"
            className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.whatsapp ? 'border-red-400' : 'border-stone-300')}
          />
          {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
        </div>
      </div>
    </div>
  )
}
