import { useState } from 'react'
import * as api from '../lib/api'
import { niceError } from '../lib/errors'
import { usePolling } from '../hooks/usePolling'
import { BTN, INPUT, money } from '../lib/format'
import DishFormModal from '../components/DishFormModal'
import { Empty, ErrorBox, Loading, Thumb } from '../components/ui'

const AVAIL = [['all', 'Hammasi'], ['in', 'Mavjud'], ['out', 'Tugagan'], ['hidden', 'Yashirin']]

export default function CookMenuPage({ isHeadChef = false }) {
  const { data, error, loading, reload } = usePolling(async () => api.listDishes())
  const [q, setQ] = useState('')
  const [avail, setAvail] = useState('all')
  const [editing, setEditing] = useState(undefined) // undefined = yopiq, null = yangi, obyekt = tahrir
  const [actionErr, setActionErr] = useState('')

  const list = (data || []).filter((d) => {
    const okQ = d.name.toLowerCase().includes(q.trim().toLowerCase())
    const okA = avail === 'all' || (avail === 'hidden' ? !d.is_active : avail === 'in' ? d.is_active && d.stock > 0 : d.stock === 0)
    return okQ && okA
  })

  async function toggle(d) {
    const error = await api.setDishActive(d.id, !d.is_active).then(() => null, (x) => x)
    setActionErr(error ? niceError(error) : ''); reload()
  }
  async function remove(d) {
    if (!window.confirm(`"${d.name}" o'chirilsinmi?`)) return
    const error = await api.deleteDish(d.id).then(() => null, (x) => x)
    setActionErr(error ? niceError(error) : ''); reload()
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">{isHeadChef ? 'Oshxona menyusi' : 'Mening menyum'}</h1>
        <button className={BTN.primary} onClick={() => setEditing(null)}>+ Taom qo'shish</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <input className={`${INPUT} max-w-xs`} placeholder="Nom bo'yicha qidirish" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Qidiruv" />
        <div className="flex gap-1">
          {AVAIL.map(([v, l]) => <button key={v} onClick={() => setAvail(v)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${avail === v ? 'bg-teal text-white' : 'bg-white ring-1 ring-ink/15'}`}>{l}</button>)}
        </div>
      </div>
      {(error || actionErr) && <ErrorBox message={error || actionErr} onRetry={reload} />}
      {loading ? <Loading /> : list.length === 0 && !error ? (
        <Empty title="Taom topilmadi" hint="Yangi taom qo'shing yoki filtrni o'zgartiring." />
      ) : (
        <ul className="space-y-2">
          {list.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-ink/10">
              <Thumb src={d.image_url} name={d.name} emoji={d.emoji} className={`size-14 rounded-lg ${d.is_active ? '' : 'opacity-40'}`} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{d.name} {!d.is_active && <span className="text-xs text-ink/50">(yashirin)</span>}</p>
                <p className="text-sm text-ink/60">{money(d.price)} · {d.stock > 0 ? `qoldi: ${d.stock}` : 'tugagan'}</p>
              </div>
              <div className="flex gap-1.5">
                <button className={BTN.ghost} onClick={() => toggle(d)}>{d.is_active ? 'Yashirish' : "Ko'rsatish"}</button>
                <button className={BTN.ghost} onClick={() => setEditing(d)}>Tahrirlash</button>
                <button className={BTN.ghost} onClick={() => remove(d)}>O'chirish</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing !== undefined && <DishFormModal dish={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); reload() }} />}
    </section>
  )
}
