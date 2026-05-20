import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

interface SchemaField {
  name: string
  type: string
  values?: string[]
}

export function useCategoryOptions() {
  return useQuery({
    queryKey: ['menu_items_schema', 'category'],
    queryFn: async () => {
      const collection = await pb.collections.getOne('menu_items')
      const fields = (collection as unknown as { fields: SchemaField[] }).fields ?? []
      const categoryField = fields.find(f => f.name === 'category' && f.type === 'select')
      return categoryField?.values ?? []
    },
    staleTime: Infinity,
  })
}
