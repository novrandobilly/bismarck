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
    <div className="flex gap-4 items-start py-4 border-b border-stone-100 last:border-0">
      <ProductThumbnail item={menuItem} />
      <div className="flex-1 min-w-0 pt-1">
        <p className="font-semibold text-stone-800 text-sm leading-snug">{menuItem.name}</p>
        {menuItem.description && <p className="text-stone-500 text-xs mt-0.5 line-clamp-2">{menuItem.description}</p>}
        <p className="text-amber-600 font-medium text-sm mt-1">{formatPrice(sessionItem.price)}</p>
        <div className="mt-2">
          <QuantitySelector value={quantity} onChange={onChangeQuantity} />
        </div>
      </div>
    </div>
  )
}
