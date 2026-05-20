import type { SessionItem } from '@/types/menu'
import { ProductThumbnail } from '@/components/ProductThumbnail'
import { QuantitySelector } from '@/components/QuantitySelector'

interface Props {
  sessionItem: SessionItem
  quantity: number
  onChangeQuantity: (qty: number) => void
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

export function MenuItemCard({ sessionItem, quantity, onChangeQuantity }: Props) {
  const menuItem = sessionItem.expand?.menu_item
  if (!menuItem) return null

  return (
    <div className="flex gap-3 items-center py-3 border-b border-stone-100 last:border-0">
      <ProductThumbnail item={menuItem} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-800 text-sm leading-snug">{menuItem.name}</p>
        {menuItem.description && <p className="text-stone-500 text-xs mt-0.5 line-clamp-1">{menuItem.description}</p>}
        <div className="flex items-center justify-between mt-1.5 gap-2">
          <p className="text-amber-600 font-medium text-sm">{formatPrice(sessionItem.price)}</p>
          <QuantitySelector value={quantity} onChange={onChangeQuantity} />
        </div>
      </div>
    </div>
  )
}
