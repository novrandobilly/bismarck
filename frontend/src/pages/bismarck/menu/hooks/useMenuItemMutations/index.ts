import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { MenuItem } from '@/types/menu'

export interface MenuItemFormData {
  name: string
  description: string
  default_price: number
  category: string
  image?: FileList
}

export function useMenuItemMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['menu_items'] })

  const createItem = useMutation({
    mutationFn: (data: MenuItemFormData) => {
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('description', data.description)
      fd.append('default_price', String(data.default_price))
      fd.append('category', data.category)
      fd.append('is_active', 'true')
      if (data.image?.[0]) fd.append('image', data.image[0])
      return pb.collection('menu_items').create<MenuItem>(fd)
    },
    onSuccess: invalidate,
  })

  const updateItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItemFormData> }) => {
      const fd = new FormData()
      if (data.name !== undefined) fd.append('name', data.name)
      if (data.description !== undefined) fd.append('description', data.description)
      if (data.default_price !== undefined) fd.append('default_price', String(data.default_price))
      if (data.category !== undefined) fd.append('category', data.category)
      if (data.image?.[0]) fd.append('image', data.image[0])
      return pb.collection('menu_items').update<MenuItem>(id, fd)
    },
    onSuccess: invalidate,
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      pb.collection('menu_items').update<MenuItem>(id, { is_active }),
    onSuccess: invalidate,
  })

  return { createItem, updateItem, toggleActive }
}
