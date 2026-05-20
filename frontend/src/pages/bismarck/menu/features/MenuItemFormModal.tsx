import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { MenuItem } from '@/types/menu'
import { cn } from '@/lib/utils/cn'
import { useCategoryOptions } from '../hooks/useCategoryOptions'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  default_price: z.coerce.number().min(0, 'Price must be 0 or more'),
  category: z.string().default(''),
  image: z.any().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  item?: MenuItem | null
  onSave: (data: FormValues) => void
  onClose: () => void
  isSaving: boolean
  saveError?: string | null
}

export function MenuItemFormModal({ item, onSave, onClose, isSaving, saveError }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  })
  const { data: categoryOptions = [] } = useCategoryOptions()

  useEffect(() => {
    if (item) {
      reset({ name: item.name, description: item.description, default_price: item.default_price, category: item.category })
    } else {
      reset({ name: '', description: '', default_price: 0, category: '' })
    }
  }, [item, reset])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-stone-800 mb-4">{item ? 'Edit Menu Item' : 'New Menu Item'}</h2>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
            <input {...register('name')} className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.name ? 'border-red-400' : 'border-stone-300')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
            <textarea {...register('description')} rows={2} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Default Price (IDR)</label>
            <input {...register('default_price')} type="number" min={0} className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.default_price ? 'border-red-400' : 'border-stone-300')} />
            {errors.default_price && <p className="text-red-500 text-xs mt-1">{errors.default_price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
            <select
              {...register('category')}
              className={cn(
                'w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white capitalize',
                errors.category ? 'border-red-400' : 'border-stone-300',
              )}
            >
              <option value="">— Select category —</option>
              {categoryOptions.map(opt => (
                <option key={opt} value={opt} className="capitalize">{opt.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Image</label>
            <input {...register('image')} type="file" accept="image/*" className="text-sm text-stone-600" />
          </div>
          <div className="flex gap-3 pt-2">
            {saveError && <p className="text-red-500 text-xs mb-2 col-span-2">{saveError}</p>}
            <button type="button" onClick={onClose} className="cursor-pointer flex-1 border border-stone-300 text-stone-700 rounded-lg py-2 text-sm hover:bg-stone-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="cursor-pointer flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2 text-sm transition-colors">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
