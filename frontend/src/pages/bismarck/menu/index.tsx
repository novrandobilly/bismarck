import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMenuItems } from '@/hooks/useMenuItems'
import { useMenuItemMutations, type MenuItemFormData } from './hooks/useMenuItemMutations'
import { MenuItemRow } from './features/MenuItemRow'
import { MenuItemFormModal } from './features/MenuItemFormModal'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { MenuItem } from '@/types/menu'

export default function MenuCatalogPage() {
  const location = useLocation()
  const { data: items = [], isLoading } = useMenuItems()
  const { createItem, updateItem, toggleActive } = useMenuItemMutations()
  const [editTarget, setEditTarget] = useState<MenuItem | null | undefined>(
    (location.state as { openNew?: boolean } | null)?.openNew ? null : undefined,
  )

  const [saveError, setSaveError] = useState<string | null>(null)

  const isModalOpen = editTarget !== undefined
  const isSaving = createItem.isPending || updateItem.isPending

  function handleSave(data: MenuItemFormData) {
    setSaveError(null)
    if (editTarget) {
      updateItem.mutate({ id: editTarget.id, data }, {
        onSuccess: () => setEditTarget(undefined),
        onError: (err) => setSaveError(err instanceof Error ? err.message : 'Failed to save item'),
      })
    } else {
      createItem.mutate(data, {
        onSuccess: () => setEditTarget(undefined),
        onError: (err) => setSaveError(err instanceof Error ? err.message : 'Failed to save item'),
      })
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Menu Catalog</h1>
            <p className="text-stone-500 text-sm">{items.filter(i => i.is_active).length} active items</p>
          </div>
          <button onClick={() => setEditTarget(null)} className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors">
            + Add Item
          </button>
        </div>
        {isLoading ? (
          <LoadingSpinner centered />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Image</th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Name</th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Price</th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase py-3 px-4">Status</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onEdit={setEditTarget}
                    onToggleActive={(i) => toggleActive.mutate({ id: i.id, is_active: !i.is_active })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isModalOpen && (
        <MenuItemFormModal item={editTarget} onSave={handleSave} onClose={() => { setEditTarget(undefined); setSaveError(null) }} isSaving={isSaving} saveError={saveError} />
      )}
    </div>
  )
}
