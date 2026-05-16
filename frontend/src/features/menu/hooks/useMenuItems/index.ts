import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { MenuItem } from '@/types/menu'

export function useMenuItems() {
  return useQuery({
    queryKey: ['menu_items'],
    queryFn: () => pb.collection('menu_items').getFullList<MenuItem>({ sort: '+name' }),
  })
}
