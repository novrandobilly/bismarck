import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'

interface Props { form: UseFormReturn<OrderFormValues> }

export function NotesSection({ form }: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-stone-800 mb-3">Notes</h2>
      <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
        <textarea
          {...form.register('notes')}
          rows={3}
          placeholder="Any special requests? (optional)"
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>
    </div>
  )
}
