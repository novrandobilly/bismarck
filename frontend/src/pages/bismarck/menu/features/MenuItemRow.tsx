import type { MenuItem } from '@/types/menu'
import { ProductThumbnail } from '@/components/ProductThumbnail'
import { cn } from '@/lib/utils/cn'

interface Props {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onToggleActive: (item: MenuItem) => void
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

export function MenuItemRow({ item, onEdit, onToggleActive }: Props) {
  return (
    <tr className={cn('border-b border-stone-100', !item.is_active && 'opacity-50')}>
      <td className="py-3 px-4"><ProductThumbnail item={item} className="w-14 h-14 rounded-lg" /></td>
      <td className="py-3 px-4">
        <p className="font-medium text-stone-800 text-sm">{item.name}</p>
        {item.category && <p className="text-stone-400 text-xs">{item.category}</p>}
      </td>
      <td className="py-3 px-4 text-sm text-stone-600">{formatPrice(item.default_price)}</td>
      <td className="py-3 px-4">
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', item.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500')}>
          {item.is_active ? 'Active' : 'Archived'}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <button onClick={() => onEdit(item)} className="cursor-pointer text-xs text-amber-600 hover:underline mr-3">Edit</button>
        <button onClick={() => onToggleActive(item)} className="cursor-pointer text-xs text-stone-500 hover:underline">
          {item.is_active ? 'Archive' : 'Restore'}
        </button>
      </td>
    </tr>
  )
}
