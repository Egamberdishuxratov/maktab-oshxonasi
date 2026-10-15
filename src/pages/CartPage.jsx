import { useRef, useState } from 'react'
import * as api from '../lib/api'
import { niceError } from '../lib/errors'
import { usePolling } from '../hooks/usePolling'
import { useAuth } from '../hooks/useAuth'
import { BTN, INPUT, money, toLocalInput } from '../lib/format'
import { Empty, ErrorBox, Loading, Stepper, Thumb } from '../components/ui'

export default function CartPage({ cart, setQty, onDone, onBrowse }) {
  const { profile } = useAuth()
  const ids = Object.keys(cart)
  const { data, error, loading, reload } = usePolling(async () => (ids.length ? api.getDishes(ids) : []))
  const [name, setName] = useState(profile.full_name || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [pickup, setPickup] = useState('')
  const [minTime] = useState(() => toLocalInput(new Date(Date.now() + 5 * 60000)))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [sending, setSending] = useState(false)
  const key = useRef(crypto.randomUUID()) // bir xil buyurtmani ikki marta yaratmaslik uchun

  if (!ids.length) return <Empty title="Savatcha bo'sh" hint="Katalogdan taom tanlang." action={<button className={BTN.primary} onClick={onBrowse}>Katalogga o'tish</button>} />
  if (loading) return <Loading />

  const lines = ids.map((id) => ({ id, qty: cart[id], dish: (data || []).find((d) => d.id === id) }))
  const total = lines.reduce((s, l) => s + (l.dish ? l.dish.price * l.qty : 0), 0)
  const hasProblem = lines.some((l) => !l.dish || l.qty > l.dish.stock)

  async function submit(e) {
    e.preventDefault()
    if (sending) return
    const errs = {}
    if (name.trim().length < 2) errs.name = 'Ismingizni kiriting.'
    if (!/^\+?[0-9 ()-]{9,16}$/.test(phone.trim())) errs.phone = "Telefon raqamini to'g'ri kiriting."
    if (!pickup || new Date(pickup) <= new Date()) errs.pickup = 'Kelajakdagi vaqtni tanlang.'
    if (hasProblem) errs.cart = "Savatchada mavjud bo'lmagan yoki zaxiradan ortiq taom bor."
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSending(true); setServerError('')
    const error = await api.placeOrder({
      name: name.trim(), phone: phone.trim(), pickup: new Date(pickup).toISOString(),
      items: lines.map((l) => ({ dish_id: l.id, qty: l.qty })), key: key.current,
    }).then(() => null, (x) => x)
    setSending(false)
    if (error) { setServerError(niceError(error)); reload(); return }
    onDone()
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <section className="space-y-3">
        <h1 className="font-display text-2xl font-bold">Savatcha</h1>
        {error && <ErrorBox message={error} onRetry={reload} />}
        {lines.map(({ id, qty, dish }) => (
          <div key={id} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-ink/10">
            <Thumb src={dish?.image_url} name={dish?.name || '?'} emoji={dish?.emoji} className="size-16 rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{dish ? dish.name : 'Taom mavjud emas'}</p>
              {dish && <p className="text-sm text-ink/60">{money(dish.price)}</p>}
              {dish && qty > dish.stock && <p className="text-xs text-tomato">Faqat {dish.stock} ta qolgan</p>}
              {!dish && <p className="text-xs text-tomato">Savatchadan olib tashlang</p>}
            </div>
            <Stepper value={qty} max={dish ? Math.min(20, dish.stock) : 0} onChange={(n) => setQty(id, n)} />
          </div>
        ))}
      </section>

      <form onSubmit={submit} className="h-fit space-y-3 rounded-xl bg-white p-4 ring-1 ring-ink/10">
        <h2 className="font-display text-lg font-bold">Buyurtma</h2>
        <label className="block text-sm font-semibold">Ism<input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} />{errors.name && <span className="text-xs text-tomato">{errors.name}</span>}</label>
        <label className="block text-sm font-semibold">Telefon<input className={INPUT} value={phone} onChange={(e) => setPhone(e.target.value)} />{errors.phone && <span className="text-xs text-tomato">{errors.phone}</span>}</label>
        <label className="block text-sm font-semibold">Olib ketish vaqti<input type="datetime-local" min={minTime} className={INPUT} value={pickup} onChange={(e) => setPickup(e.target.value)} />{errors.pickup && <span className="text-xs text-tomato">{errors.pickup}</span>}</label>
        <p className="flex justify-between border-t border-ink/10 pt-3 font-bold"><span>Jami</span><span>{money(total)}</span></p>
        {errors.cart && <p className="text-sm text-tomato">{errors.cart}</p>}
        {serverError && <ErrorBox message={serverError} />}
        <button disabled={sending} className={`${BTN.primary} w-full`}>{sending ? 'Yuborilmoqda...' : 'Buyurtma berish'}</button>
      </form>
    </div>
  )
}
