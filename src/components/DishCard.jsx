import { BTN, money } from '../lib/format'
import { Thumb } from './ui'

export default function DishCard({ dish, inCart, onAdd, onOpen }) {
  const out = dish.stock <= 0
  const maxed = inCart >= dish.stock
  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-ink/10">
      <button onClick={() => onOpen(dish.id)} className="relative text-left">
        <Thumb src={dish.image_url} name={dish.name} emoji={dish.emoji} className="aspect-[4/3] w-full" />
        <span className="absolute right-0 top-3 rounded-l-md bg-sun px-2.5 py-1 font-display text-sm font-extrabold">{money(dish.price)}</span>
        <div className="px-4 pt-3">
          <span className="text-xs font-semibold text-teal">{dish.category === 'ovqat' ? 'Ovqat' : 'Ichimlik'}</span>
          <h3 className="font-display text-lg font-bold leading-tight">{dish.name}</h3>
        </div>
      </button>
      <div className="mx-4 mt-3 border-t-2 border-dashed border-ink/15" />
      <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-3">
        <p className={`text-sm ${out ? 'font-semibold text-tomato' : 'text-ink/60'}`}>{out ? 'Tugagan' : `Qoldi: ${dish.stock} ta`}</p>
        <button disabled={out || maxed} onClick={() => onAdd(dish)} className={BTN.primary}>
          {inCart ? `Savatchada: ${inCart}` : 'Savatchaga'}
        </button>
      </div>
    </article>
  )
}
