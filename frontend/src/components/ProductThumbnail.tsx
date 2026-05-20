import { pb } from '@/lib/pocketbase'
import type { MenuItem } from '@/types/menu'
import { cn } from '@/lib/utils/cn'

interface Props {
  item: Pick<MenuItem, 'id' | 'image' | 'name' | 'collectionId' | 'collectionName'>
  className?: string
}

export function ProductThumbnail({ item, className }: Props) {
  const src = item.image
    ? pb.files.getURL(item as Parameters<typeof pb.files.getURL>[0], item.image, { thumb: '144x144' })
    : null

  return (
    <div className={cn('w-16 h-16 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center shrink-0', className)}>
      {src ? (
        <img src={src} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-2xl" role="img" aria-label={item.name}>🥯</span>
      )}
    </div>
  )
}
