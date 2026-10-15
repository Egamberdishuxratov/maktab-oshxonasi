import { useState } from 'react'
import * as api from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { INPUT } from '../lib/format'
import DishCard from '../components/DishCard'
import { Empty, ErrorBox, Loading } from '../components/ui'

const CATS = [['all', 'Hammasi'], ['ovqat', 'Ovqat'], ['ichimlik', 'Ichimlik']]

export default function CatalogPage({ cart, onAdd, onOpen }) {
  const { data, error, loading, reload } = usePolling(async () => api.listDishes())
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [today] = useState(() => new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' }))

  const list = (data || []).filter((d) => (cat === 'all' || d.category === cat) && d.name.toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <section className="space-y-4">
      <div className="rounded-lg border-b-4 border-sun bg-teal-dark px-4 py-4 text-white sm:px-5"><p className="text-sm text-white/70">{today}</p><h1 className="font-display text-2xl font-extrabold">Bugungi menyu</h1><p className="text-sm text-white/70">Tanaffusdan oldin tanlang, tayyor bo'lganda olib keting.</p></div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input className={`${INPUT} w-full sm:max-w-xs`} placeholder="Taom nomini qidiring" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Qidiruv" />
        <div className="flex flex-wrap gap-1">
          {CATS.map(([v, l]) => (
            <button key={v} onClick={() => setCat(v)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${cat === v ? 'bg-teal text-white' : 'bg-white ring-1 ring-ink/15'}`}>{l}</button>
          ))}
        </div>
      </div>
      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading ? <Loading /> : list.length === 0 && !error ? (
        <Empty title="Taom topilmadi" hint={data?.length ? "Qidiruv yoki filtrni o'zgartirib ko'ring." : "Hozircha menyuda taom yo'q."} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => <DishCard key={d.id} dish={d} inCart={cart[d.id] || 0} onAdd={onAdd} onOpen={onOpen} />)}
        </div>
      )}
    </section>
  )
}
