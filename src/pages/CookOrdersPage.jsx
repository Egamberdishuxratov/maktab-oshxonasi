import { useState } from 'react'
import * as api from '../lib/api'
import { niceError } from '../lib/errors'
import { usePolling } from '../hooks/usePolling'
import { ACTIVE, BTN, INPUT, NEXT, NEXT_LABEL, STATUS } from '../lib/format'
import OrderCard from '../components/OrderCard'
import { Empty, ErrorBox, Loading } from '../components/ui'

export default function CookOrdersPage() {
  const { data, error, loading, reload } = usePolling(async () => api.listOrders())
  const [filter, setFilter] = useState('active')
  const all = data || []
  const activeCount = all.filter((o) => ACTIVE.includes(o.status)).length
  const list = all.filter((o) => (filter === 'all' ? true : filter === 'active' ? ACTIVE.includes(o.status) : o.status === filter))
  const filters = [['active', `Faol (${activeCount})`], ['all', 'Hammasi'], ...Object.entries(STATUS).map(([k, v]) => [k, `${v.label} (${all.filter((o) => o.status === k).length})`])]

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="font-display text-2xl font-bold">Kelgan buyurtmalar</h1>
        <p className="text-sm text-ink/60">Faol buyurtmalar: <b>{activeCount}</b></p>
      </div>
      <div className="flex flex-wrap gap-1">
        {filters.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${filter === k ? 'bg-teal text-white' : 'bg-white ring-1 ring-ink/15'}`}>{l}</button>
        ))}
      </div>
      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading ? <Loading /> : list.length === 0 && !error ? (
        <Empty title="Buyurtma yo'q" hint="Yangi buyurtma kelganda shu yerda avtomatik ko'rinadi." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((o) => <OrderCard key={o.id} order={o} showCustomer><Actions order={o} onChanged={reload} /></OrderCard>)}
        </div>
      )}
    </section>
  )
}

function Actions({ order, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [err, setErr] = useState('')
  const next = NEXT[order.status]
  if (!next) return null

  async function change(status, why) {
    if (busy) return
    if (status === 'rejected' && reason.trim().length < 3) return setErr('Rad etish sababini yozing.')
    setBusy(true); setErr('')
    const error = await api.setStatus(order.id, status, why).then(() => null, (x) => x)
    setBusy(false)
    if (error) return setErr(niceError(error))
    setRejecting(false); onChanged()
  }

  return (
    <div className="mt-3 space-y-2">
      {err && <ErrorBox message={err} />}
      {rejecting ? (
        <div className="space-y-2">
          <input className={INPUT} placeholder="Rad etish sababi" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex gap-2">
            <button disabled={busy} className={BTN.danger} onClick={() => change('rejected', reason)}>Rad etish</button>
            <button className={BTN.ghost} onClick={() => setRejecting(false)}>Ortga</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button disabled={busy} className={BTN.primary} onClick={() => change(next)}>{busy ? 'Kuting...' : NEXT_LABEL[next]}</button>
          {order.status === 'new' && <button disabled={busy} className={BTN.ghost} onClick={() => setRejecting(true)}>Rad etish</button>}
        </div>
      )}
    </div>
  )
}
