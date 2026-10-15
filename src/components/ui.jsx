import { useState } from 'react'
import { BTN, STATUS } from '../lib/format'

export function Loading({ text = 'Yuklanmoqda...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink/60" role="status">
      <span className="size-5 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      {text}
    </div>
  )
}

export function Empty({ title, hint, action }) {
  return (
    <div className="rounded-xl border border-dashed border-ink/20 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-ink/60">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900 ring-1 ring-red-200" role="alert">
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className={BTN.ghost}>
          Qayta urinish
        </button>
      )}
    </div>
  )
}

export function Notice({ children }) {
  return <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200" role="status">{children}</div>
}

export function StatusBadge({ status }) {
  const s = STATUS[status]
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
}

export function Thumb({ src, name, emoji, className = '' }) {
  const [bad, setBad] = useState(false)
  if (!src || bad) {
    const small = /size-/.test(className)
    return (
      <div className={`flex items-center justify-center bg-sun/30 ${small ? 'text-2xl' : 'text-6xl'} ${className}`} role="img" aria-label={name}>
        {emoji || name?.[0]?.toUpperCase()}
      </div>
    )
  }
  return <img src={src} alt={name} loading="lazy" onError={() => setBad(true)} className={`object-cover ${className}`} />
}

export function Stepper({ value, onChange, max = 20 }) {
  return (
    <div className="inline-flex items-center rounded-lg bg-white ring-1 ring-ink/15">
      <button type="button" aria-label="Kamaytirish" onClick={() => onChange(value - 1)} className="size-9 text-lg hover:bg-ink/5">−</button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button type="button" aria-label="Ko'paytirish" disabled={value >= max} onClick={() => onChange(value + 1)} className="size-9 text-lg hover:bg-ink/5 disabled:opacity-30">+</button>
    </div>
  )
}
