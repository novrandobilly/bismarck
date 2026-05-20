import { useMenuItems } from "@/hooks/useMenuItems";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { MenuItem } from "@/types/menu";

function categoryLabel(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {item.image ? (
        <img
          src={`http://127.0.0.1:8090/api/files/${item.collectionId}/${item.id}/${item.image}`}
          alt={item.name}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-amber-50 flex items-center justify-center text-5xl">
          🥯
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-stone-800 text-base leading-tight">
            {item.name}
          </h3>
          <span className="shrink-0 text-sm font-semibold text-stone-700">
            Rp {item.default_price.toLocaleString("id-ID")}
          </span>
        </div>
        {item.category && (
          <span className="text-xs text-amber-700 bg-amber-50 rounded-full px-2 py-0.5 self-start mb-2 capitalize">
            {categoryLabel(item.category)}
          </span>
        )}
        {item.description && (
          <p className="text-stone-500 text-sm leading-relaxed flex-1">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PublicMenuPage() {
  const { data: items = [], isLoading } = useMenuItems();
  const activeItems = items.filter((i) => i.is_active);

  const grouped = activeItems.reduce<Record<string, MenuItem[]>>(
    (acc, item) => {
      const key = item.category || "other";
      (acc[key] ??= []).push(item);
      return acc;
    },
    {},
  );

  const categories = Object.keys(grouped).sort();

  return (
    <>
      <header className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <p className="text-amber-500 font-semibold text-sm tracking-widest uppercase mb-2">
            Our Bakes
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            Menu
          </h1>
          <p className="text-stone-500 mt-2 max-w-sm mx-auto text-sm">
            All items are made fresh per pre-order session — prices shown are
            base prices and may vary per session.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner centered />
          </div>
        ) : activeItems.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <p className="text-4xl mb-3">🍞</p>
            <p className="font-medium text-stone-600">No menu items yet</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          categories.map((cat) => (
            <section key={cat}>
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                {categoryLabel(cat)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {grouped[cat].map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}
