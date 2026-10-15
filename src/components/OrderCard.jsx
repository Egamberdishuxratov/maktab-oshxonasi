import { FLOW, STATUS, dt, money } from '../lib/format'
import { StatusBadge } from './ui'

export default function OrderCard({ order, showCustomer, children }) {
  const events = [...(order.order_events || [])].sort((a, b) => a.id - b.id)
  const items = order.order_items || []
  const idx = FLOW.indexOf(order.status)
  return (
    <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold">Buyurtma №{order.number}</h3>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-0.5 text-xs text-ink/50">ID: {order.id.slice(0, 8)} · {dt(order.created_at)}</p>

      {idx >= 0 && (
        <ol className="mt-3 flex gap-1" aria-label="Buyurtma bosqichlari">
          {FLOW.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= idx ? 'bg-teal' : 'bg-ink/10'}`} />
              <span className={`mt-1 block text-[11px] leading-tight ${i === idx ? 'font-bold' : 'text-ink/50'}`}>{STATUS[s].label}</span>
            </li>
          ))}
        </ol>
      )}

      <ul className="mt-3 divide-y divide-ink/10 text-sm">
        {items.map((i) => (
          <li key={i.id} className="flex justify-between py-1.5">
            <span>{i.dish_name} × {i.qty}</span>
            <span className="tabular-nums">{money(i.unit_price * i.qty)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex justify-between font-semibold"><span>Jami</span><span>{money(order.total)}</span></p>
      <p className="mt-1 text-sm text-ink/70">Olib ketish vaqti: {dt(order.pickup_time)}</p>
      {showCustomer && <p className="text-sm text-ink/70">Mijoz: {order.customer_name}, {order.customer_phone}</p>}

      {order.reject_reason && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">Rad etish sababi: {order.reject_reason}</p>
      )}

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-semibold text-teal">Holatlar tarixi</summary>
        <ul className="mt-2 space-y-1 border-l-2 border-ink/10 pl-3">
          {events.map((e) => (
            <li key={e.id}>
              <span className="font-semibold">{STATUS[e.status]?.label}</span>
              <span className="text-ink/50"> — {dt(e.created_at)}</span>
              {e.note && <span className="text-ink/70"> ({e.note})</span>}
            </li>
          ))}
        </ul>
      </details>
      {children}
    </article>
  )
}
