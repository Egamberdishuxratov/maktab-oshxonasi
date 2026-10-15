import * as api from '../lib/api'
import { usePolling } from '../hooks/usePolling'
import { BTN, money } from '../lib/format'
import { Empty, ErrorBox, Loading, Stepper, Thumb } from '../components/ui'

export default function DishDetailPage({ dishId, cart, setQty, onBack }) {
  const { data: dish, error, loading, reload } = usePolling(async () => api.getDish(dishId))
  const back = <button onClick={onBack} className={BTN.ghost}>← Katalogga qaytish</button>
  if (loading) return <Loading />
  if (error) return <div className="space-y-3"><ErrorBox message={error} onRetry={reload} />{back}</div>
  if (!dish) return <Empty title="Taom topilmadi" hint="U sotuvdan olingan bo'lishi mumkin." action={back} />

  const qty = cart[dish.id] || 0
  return (
    <section className="space-y-4">
      {back}
      <div className="grid overflow-hidden rounded-xl bg-white ring-1 ring-ink/10 md:grid-cols-2">
        <Thumb src={dish.image_url} name={dish.name} emoji={dish.emoji} className="h-64 w-full md:h-full" />
        <div className="space-y-3 p-5">
          <span className="text-xs font-semibold text-teal">{dish.category === 'ovqat' ? 'Ovqat' : 'Ichimlik'}</span>
          <h1 className="font-display text-3xl font-bold">{dish.name}</h1>
          <dl className="space-y-1 text-sm">
            <div><dt className="inline font-semibold">Tarkibi: </dt><dd className="inline">{dish.ingredients || '—'}</dd></div>
            <div><dt className="inline font-semibold">Porsiya: </dt><dd className="inline">{dish.portion || '—'}</dd></div>
            <div><dt className="inline font-semibold">Mavjud: </dt><dd className="inline">{dish.stock > 0 ? `${dish.stock} ta` : 'Tugagan'}</dd></div>
          </dl>
          <p className="font-display text-2xl font-bold">{money(dish.price)}</p>
          {dish.stock <= 0 ? <p className="text-tomato">Bugun tugagan</p> : qty === 0 ? (
            <button className={BTN.primary} onClick={() => setQty(dish.id, 1)}>Savatchaga qo'shish</button>
          ) : (
            <div className="flex items-center gap-3"><Stepper value={qty} max={Math.min(20, dish.stock)} onChange={(n) => setQty(dish.id, n)} /><span className="text-sm text-ink/60">savatchada</span></div>
          )}
        </div>
      </div>
    </section>
  )
}
