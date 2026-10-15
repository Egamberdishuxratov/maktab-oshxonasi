import { useState } from 'react'
import * as api from '../lib/api'
import { niceError } from '../lib/errors'
import { BTN, INPUT } from '../lib/format'
import { ErrorBox } from './ui'

export default function DishFormModal({ dish, onClose, onSaved }) {
  const [f, setF] = useState({
    name: dish?.name ?? '', category: dish?.category ?? 'ovqat', price: dish?.price ?? '', emoji: dish?.emoji ?? '',
    image_url: dish?.image_url ?? '', ingredients: dish?.ingredients ?? '', portion: dish?.portion ?? '', stock: dish?.stock ?? '',
  })
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (saving) return
    const price = Number(f.price), stock = Number(f.stock)
    if (f.name.trim().length < 2) return setErr('Taom nomini kiriting (kamida 2 belgi).')
    if (!Number.isInteger(price) || price <= 0) return setErr("Narx musbat butun son bo'lishi kerak.")
    if (!Number.isInteger(stock) || stock < 0) return setErr("Mavjud son 0 yoki undan katta butun son bo'lishi kerak.")
    setSaving(true); setErr('')
    const row = {
      name: f.name.trim(), category: f.category, price, stock, emoji: f.emoji.trim() || null,
      image_url: f.image_url.trim() || null, ingredients: f.ingredients.trim() || null, portion: f.portion.trim() || null,
    }
    const error = await api.saveDish(row, dish?.id).then(() => null, (x) => x)
    setSaving(false)
    if (error) return setErr(niceError(error))
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-t-2xl bg-mint p-5 sm:rounded-2xl">
        <h2 className="font-display text-xl font-bold">{dish ? 'Taomni tahrirlash' : "Yangi taom qo'shish"}</h2>
        {err && <ErrorBox message={err} />}
        <label className="block text-sm font-semibold">Nomi<input className={INPUT} value={f.name} onChange={set('name')} /></label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Kategoriya
            <select className={INPUT} value={f.category} onChange={set('category')}>
              <option value="ovqat">Ovqat</option><option value="ichimlik">Ichimlik</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">Narx (so'm)<input type="number" min="1" className={INPUT} value={f.price} onChange={set('price')} /></label>
          <label className="block text-sm font-semibold">Porsiya<input className={INPUT} placeholder="300 g" value={f.portion} onChange={set('portion')} /></label>
          <label className="block text-sm font-semibold">Kunlik mavjud son<input type="number" min="0" className={INPUT} value={f.stock} onChange={set('stock')} /></label>
        </div>
        <label className="block text-sm font-semibold">Tarkibi<textarea rows="2" className={INPUT} value={f.ingredients} onChange={set('ingredients')} /></label>
        <label className="block text-sm font-semibold">Rasm havolasi (URL)<input className={INPUT} placeholder="https://..." value={f.image_url} onChange={set('image_url')} /></label>
        <label className="block text-sm font-semibold">Rasm bo'lmasa belgi (emoji)<input className={INPUT} placeholder="🍲" value={f.emoji} onChange={set('emoji')} /></label>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={BTN.ghost}>Bekor qilish</button>
          <button disabled={saving} className={BTN.primary}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
        </div>
      </form>
    </div>
  )
}
