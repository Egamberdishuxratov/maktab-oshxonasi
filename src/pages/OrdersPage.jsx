import { useState } from 'react'
import * as api from '../lib/api'
import { niceError } from '../lib/errors'
import { usePolling } from '../hooks/usePolling'
import { BTN } from '../lib/format'
import OrderCard from '../components/OrderCard'
import { Empty, ErrorBox, Loading, Notice } from '../components/ui'

export default function OrdersPage({ notice, onBrowse }) {
  const { data, error, loading, reload } = usePolling(async () => api.listOrders())
  return (
    <section className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Buyurtmalarim</h1>
      {notice && <Notice>{notice}</Notice>}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading ? <Loading /> : !data?.length && !error ? (
        <Empty title="Hali buyurtma yo'q" hint="Birinchi buyurtmangizni katalogdan bering." action={<button className={BTN.primary} onClick={onBrowse}>Katalogga o'tish</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map((o) => <OrderCard key={o.id} order={o}>{o.status === 'new' && <CancelButton id={o.id} onDone={reload} />}</OrderCard>)}
        </div>
      )}
    </section>
  )
}

function CancelButton({ id, onDone }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  async function cancel() {
    if (busy || !window.confirm('Buyurtmani bekor qilasizmi?')) return
    setBusy(true); setErr('')
    const error = await api.cancelOrder(id).then(() => null, (x) => x)
    setBusy(false)
    if (error) setErr(niceError(error)); else onDone()
  }
  return (
    <div className="mt-3 space-y-2">
      {err && <ErrorBox message={err} />}
      <button disabled={busy} onClick={cancel} className={BTN.danger}>{busy ? 'Kuting...' : 'Bekor qilish'}</button>
    </div>
  )
}
