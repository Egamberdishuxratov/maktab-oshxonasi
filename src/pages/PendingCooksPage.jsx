import { useState } from 'react'
import * as api from '../lib/api'
import { niceError } from '../lib/errors'
import { BTN } from '../lib/format'
import { useAuth } from '../hooks/useAuth'
import { usePolling } from '../hooks/usePolling'
import { Empty, ErrorBox, Loading } from '../components/ui'

export default function PendingCooksPage() {
  const { profile } = useAuth()
  const isHeadChef = profile.role === 'head_cook'
  const { data, error, loading, reload } = usePolling(async () => api.listCooks())
  const [busyId, setBusyId] = useState('')
  const [actionError, setActionError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  async function approve(cook) {
    if (busyId) return
    setBusyId(cook.id)
    setActionError('')
    try {
      await api.approveCook(cook.id)
      reload()
    } catch (e) {
      setActionError(niceError(e))
    } finally {
      setBusyId('')
    }
  }

  const cooks = data || []
  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">{isHeadChef ? 'Oshpazlar' : 'Maktab oshpazlari'}</h1>
        <p className="mt-1 text-sm text-ink/60">
          {isHeadChef ? "Oshpazlar ro'yxati va tasdiqlash holati." : "Maktab oshxonasida ishlaydigan tasdiqlangan oshpazlar."}
        </p>
      </div>
      {(error || actionError) && <ErrorBox message={error || actionError} onRetry={reload} />}
      {loading ? <Loading /> : cooks.length === 0 && !error ? (
        <Empty title="Oshpazlar ro'yxati bo'sh" hint="Oshpazlar ro'yxatga qo'shilganda shu yerda ko'rinadi." />
      ) : (
        <ul className="space-y-3">
          {cooks.map((cook) => (
            <li key={cook.id} className="rounded-xl bg-white p-4 ring-1 ring-ink/10">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 rounded-lg p-1 text-left hover:bg-ink/5"
                  aria-expanded={expandedId === cook.id}
                  onClick={() => setExpandedId((id) => id === cook.id ? null : cook.id)}
                >
                  <span className="block font-semibold">{cook.full_name}</span>
                  <span className="block text-sm text-ink/60">{cook.role === 'head_cook' ? 'Bosh oshpaz' : 'Oshpaz'}</span>
                  <span className="mt-1 block text-xs font-semibold text-teal">
                    {expandedId === cook.id ? 'Yopish' : 'Stajini ko\'rish'}
                  </span>
                  {isHeadChef && cook.role !== 'head_cook' && (
                    <span className="mt-1 block text-sm text-ink/60">
                      {cook.approval_status === 'pending' ? 'Tasdiq kutilmoqda' : 'Tasdiqlangan'}
                      {' · '}Ro'yxatdan o'tgan: {new Date(cook.created_at).toLocaleDateString('uz-UZ')}
                    </span>
                  )}
                </button>
                {isHeadChef && cook.role === 'cook' && cook.approval_status === 'pending' && (
                  <button disabled={busyId === cook.id} className={BTN.primary} onClick={() => approve(cook)}>
                    {busyId === cook.id ? 'Tasdiqlanmoqda...' : 'Tasdiqlash'}
                  </button>
                )}
              </div>
              {expandedId === cook.id && (
                <p className="mt-3 border-t border-ink/10 pt-3 text-sm">
                  Ish tajribasi (namuna): <strong>{cook.experience_years ?? 0} yil</strong>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
