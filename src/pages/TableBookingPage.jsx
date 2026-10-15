import { useState } from 'react'
import * as api from '../lib/api'
import { niceError } from '../lib/errors'
import { BTN, INPUT } from '../lib/format'
import { useAuth } from '../hooks/useAuth'
import { usePolling } from '../hooks/usePolling'
import { Empty, ErrorBox, Loading } from '../components/ui'

const CHAIR_COLORS = ['#1f5c4d', '#e6a823', '#d96852', '#527da8', '#7a638f', '#72a276']

const localDateTime = (date) => {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function TablePhoto({ capacity, table, className = '' }) {
  const chairs = Array.from({ length: capacity }, (_, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / capacity
    return {
      x: 90 + Math.cos(angle) * 58,
      y: 58 + Math.sin(angle) * 39,
      angle: (angle * 180) / Math.PI + 90,
      color: CHAIR_COLORS[index],
    }
  })

  return (
    <svg
      viewBox="0 0 180 116"
      role="img"
      aria-label={`${capacity} kishilik maktab oshxonasi stoli ${table}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="180" height="116" fill="#edf3ed" />
      <path d="M0 24h180M0 58h180M0 92h180M30 0v116M75 0v116M120 0v116M165 0v116" stroke="#d8e3d9" strokeWidth="1" />
      {chairs.map((chair, index) => (
        <g key={index} transform={`translate(${chair.x} ${chair.y}) rotate(${chair.angle})`}>
          <rect x="-9" y="-8" width="18" height="16" rx="4" fill={chair.color} />
          <rect x="-6" y="-6" width="12" height="8" rx="3" fill="#ffffff" fillOpacity=".28" />
        </g>
      ))}
      <ellipse cx="90" cy="61" rx="43" ry="29" fill="#193d34" fillOpacity=".15" />
      <ellipse cx="90" cy="56" rx="43" ry="29" fill="#d6a86b" stroke="#a97842" strokeWidth="2" />
      <rect x="68" y="43" width="44" height="27" rx="4" fill="#f6f0df" stroke="#d6c9ac" strokeWidth="1.5" />
      <circle cx="90" cy="56" r="8" fill="#ffffff" stroke="#9fb3a0" strokeWidth="2" />
      <circle cx="87" cy="54" r="2" fill="#75a95c" />
      <circle cx="93" cy="57" r="2" fill="#e6a823" />
      <path d="M73 48h8v6h-8z" fill="#d96852" />
      <path d="M99 60h8v6h-8z" fill="#527da8" />
    </svg>
  )
}

const initialBookingTime = () => {
  const date = new Date(Date.now() + 60 * 60 * 1000)
  date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30, 0, 0)
  return localDateTime(date)
}

export default function TableBookingPage() {
  const { profile } = useAuth()
  const isStudent = profile.role === 'student'
  const isStaff = profile.role === 'cook' || profile.role === 'head_cook'
  const [startAt, setStartAt] = useState(initialBookingTime)
  const [tableNumber, setTableNumber] = useState('')
  const [guests, setGuests] = useState('1')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { data, error: loadError, loading, reload } = usePolling(() => api.getTableReservationData(startAt))
  const availableTables = data?.availableTables || []
  const tables = data?.tables || []
  const selectedTable = tables.find((table) => table.number === Number(tableNumber))
  const reservations = data?.reservations || []

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.bookTable({ tableNumber, startAt, guests })
      setNotice(`${tableNumber}-stol bron qilindi.`)
      setTableNumber('')
      reload()
    } catch (e) {
      setError(niceError(e))
      reload()
    } finally {
      setBusy(false)
    }
  }

  async function cancel(reservation) {
    const confirmed = window.confirm(`${reservation.table_number}-stol bronini bekor qilmoqchimisiz?`)
    if (!confirmed || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.cancelTableReservation(reservation.id)
      setNotice('Stol broni bekor qilindi.')
      reload()
    } catch (e) {
      setError(niceError(e))
    } finally {
      setBusy(false)
    }
  }

  async function confirmReservation(reservation) {
    if (busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.confirmTableReservation(reservation.id)
      setNotice(`${reservation.table_number}-stol broni tasdiqlandi.`)
      reload()
    } catch (e) {
      setError(niceError(e))
      reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{isStudent ? 'Stol bron qilish' : 'Stollar bandligi'}</h1>
        <p className="mt-1 text-sm text-ink/60">
          {isStudent
            ? "Broningiz oshpaz tasdiqlaguncha kutiladi. Kutilayotgan stol boshqa o'quvchiga band bo'ladi."
            : "O'quvchilar bronini ko'ring va tasdiqlang."}
        </p>
      </div>
      {(loadError || error) && <ErrorBox message={error || loadError} onRetry={reload} />}
      {notice && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">{notice}</p>}

      <label className="block max-w-md rounded-xl bg-white p-4 text-sm font-semibold ring-1 ring-ink/10 sm:p-6">Sana va vaqt
        <input
          type="datetime-local"
          min={localDateTime(new Date())}
          className={INPUT}
          value={startAt}
          onChange={(event) => { setStartAt(event.target.value); setTableNumber('') }}
          required
        />
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{isStudent ? "Bo'sh stolni tanlang" : 'Tanlangan vaqtdagi stollar'}</legend>
        {loading ? <Loading text="Stollar tekshirilmoqda..." /> : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {tables.map((table) => {
              const available = availableTables.includes(table.number)
              const tableReservations = reservations.filter((reservation) => (
                reservation.table_number === table.number
                && ['pending', 'confirmed'].includes(reservation.status)
                && new Date(startAt) < new Date(new Date(reservation.start_at).getTime() + 60 * 60 * 1000)
                && new Date(startAt).getTime() + 60 * 60 * 1000 > new Date(reservation.start_at)
              ))
              return (
                <button
                  key={table.number}
                  type="button"
                  disabled={!available || !isStudent}
                  aria-pressed={Number(tableNumber) === table.number}
                  onClick={() => { setTableNumber(String(table.number)); setGuests('1') }}
                  className={`rounded-lg px-3 py-3 text-sm font-semibold ring-1 transition ${
                    Number(tableNumber) === table.number
                      ? 'bg-teal text-white ring-teal'
                      : available
                        ? 'bg-white ring-ink/15 hover:bg-teal/10'
                        : 'cursor-not-allowed bg-ink/5 text-ink/40 ring-ink/10'
                  }`}
                >
                  <TablePhoto capacity={table.capacity} table={table.number} className="mb-2 h-24 w-full rounded-md" />
                  <span className="block">{table.number}-stol · {table.capacity} kishilik</span>
                  <span className="block text-xs">{available ? "Bo'sh" : 'Band'}</span>
                  {!isStudent && tableReservations.map((reservation) => (
                    <span key={reservation.id} className="mt-1 block truncate text-xs font-normal">
                      {reservation.student_name}{reservation.student_grade ? ` · ${reservation.student_grade}-sinf` : ''}
                      {reservation.status === 'pending' ? ' · Kutilmoqda' : ' · Tasdiqlandi'}
                    </span>
                  ))}
                </button>
              )
            })}
          </div>
        )}
        {!loading && availableTables.length === 0 && (
          <p className="mt-2 text-sm text-tomato">Bu vaqtda bo'sh stol qolmagan. Boshqa vaqtni tanlang.</p>
        )}
      </fieldset>
      {isStudent && <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-4 ring-1 ring-ink/10 sm:p-6">
        <label className="block text-sm font-semibold">Odam soni
          <select disabled={!selectedTable} className={INPUT} value={guests} onChange={(event) => setGuests(event.target.value)}>
            {Array.from({ length: selectedTable?.capacity || 0 }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>{count} kishi</option>
            ))}
          </select>
        </label>
        <button disabled={busy || loading || !tableNumber} className={BTN.primary}>
          {busy ? 'Saqlanmoqda...' : 'Stolni bron qilish'}
        </button>
      </form>}

      <div className="space-y-3">
        <h2 className="font-display text-xl font-bold">{isStudent ? 'Mening bronlarim' : "O'quvchilar bronlari"}</h2>
        {!loading && reservations.length === 0 ? (
          <Empty title={isStudent ? "Hozircha stol bron qilmagansiz" : "Tanlangan vaqtda bron qilingan stol yo'q"} />
        ) : (
          <ul className="space-y-3">
            {reservations.map((reservation) => (
              <li key={reservation.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-ink/10">
                <TablePhoto
                  capacity={tables.find((table) => table.number === reservation.table_number)?.capacity || 1}
                  table={reservation.table_number}
                  className="h-20 w-24 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{reservation.table_number}-stol · {reservation.guests} kishi</p>
                  <p className="text-sm text-ink/60">{new Date(reservation.start_at).toLocaleString('uz-UZ')}</p>
                  {!isStudent && (
                    <p className="text-sm text-ink/70">
                      Bron qildi: {reservation.student_name}
                      {reservation.student_grade ? ` · ${reservation.student_grade}-sinf` : ''}
                    </p>
                  )}
                  <p className={`mt-1 text-sm ${
                    reservation.status === 'confirmed'
                      ? 'text-teal'
                      : reservation.status === 'pending'
                        ? 'text-amber-700'
                        : 'text-ink/50'
                  }`}>
                    {reservation.status === 'confirmed'
                      ? 'Oshpaz tasdiqladi'
                      : reservation.status === 'pending'
                        ? 'Oshpaz tasdig‘i kutilmoqda'
                        : 'Bekor qilingan'}
                  </p>
                </div>
                {isStaff && reservation.status === 'pending' && (
                  <button disabled={busy} className={BTN.primary} onClick={() => confirmReservation(reservation)}>
                    {busy ? 'Saqlanmoqda...' : 'Bronni tasdiqlash'}
                  </button>
                )}
                {isStudent && ['pending', 'confirmed'].includes(reservation.status) && (
                  <button disabled={busy} className={BTN.danger} onClick={() => cancel(reservation)}>
                    Bronni bekor qilish
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
