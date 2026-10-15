export const money = (n) => new Intl.NumberFormat('ru-RU').format(n) + " so'm"
export const dt = (s) =>
  new Date(s).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
export const toLocalInput = (d) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export const STATUS = {
  new: { label: 'Yangi', cls: 'bg-sky-100 text-sky-900' },
  accepted: { label: 'Qabul qilindi', cls: 'bg-indigo-100 text-indigo-900' },
  preparing: { label: 'Tayyorlanmoqda', cls: 'bg-amber-100 text-amber-900' },
  ready: { label: 'Tayyor', cls: 'bg-emerald-100 text-emerald-900' },
  done: { label: 'Topshirildi', cls: 'bg-teal/15 text-teal-dark' },
  rejected: { label: 'Rad etildi', cls: 'bg-red-100 text-red-900' },
  cancelled: { label: 'Bekor qilindi', cls: 'bg-stone-200 text-stone-700' },
}
export const FLOW = ['new', 'accepted', 'preparing', 'ready', 'done']
export const ACTIVE = ['new', 'accepted', 'preparing', 'ready']
export const NEXT = { new: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'done' }
export const NEXT_LABEL = {
  accepted: 'Qabul qilish',
  preparing: 'Tayyorlashni boshlash',
  ready: 'Tayyor deb belgilash',
  done: 'Topshirildi',
}

export const BTN = {
  primary:
    'rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-50',
  ghost:
    'rounded-lg bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-ink/15 transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50',
  danger:
    'rounded-lg bg-tomato px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
}
export const INPUT =
  'w-full rounded-lg border-0 bg-white px-3 py-2.5 text-sm ring-1 ring-ink/15 outline-none focus:ring-2 focus:ring-teal'
