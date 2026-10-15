import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { niceError } from '../lib/errors'
import { BTN, INPUT } from '../lib/format'
import { ErrorBox } from '../components/ui'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({
    role: 'student', full_name: '', phone: '', email: '', password: '', grade: '',
  })
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setErr('')
    setSuccess('')
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Email manzilini to'g'ri kiriting.")
    if (f.password.length < 5) return setErr("Parol kamida 5 belgidan iborat bo'lsin.")
    if (mode === 'register') {
      if (f.full_name.trim().length < 2) return setErr('Ismingizni kiriting.')
      if (!/^\+?[0-9 ()-]{9,16}$/.test(f.phone.trim())) return setErr("Telefon raqamini to'g'ri kiriting.")
      if (f.role === 'student' && !f.grade) return setErr("O'qish sinfingizni tanlang.")
    }
    setBusy(true)
    try {
      if (mode === 'login') await signIn(f.email, f.password)
      else {
        const user = await signUp(f)
        if (user.approval_status === 'pending') {
          setSuccess("Oshpaz akkauntingiz yaratildi. Kirishdan oldin bosh oshpaz tasdiqlashi kerak.")
          setMode('login')
        }
      }
      setBusy(false)
    } catch (x) {
      setErr(niceError(x))
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-3 py-5 sm:px-4 sm:py-10">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink/10">
        <div className="border-b-4 border-sun bg-teal-dark px-4 py-4 text-white sm:px-6 sm:py-5">
          <h1 className="font-display text-2xl font-extrabold">Smart Oshxona</h1>
          <p className="text-sm text-white/70">Maktab oshxonasi: oldindan buyurtma bering, navbatda turmang.</p>
        </div>
        <form onSubmit={submit} className="space-y-3 p-4 sm:p-6">
          <h2 className="font-display text-xl font-bold">{mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}</h2>
          {err && <ErrorBox message={err} />}
          {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">{success}</p>}
          {mode === 'register' && (
            <>
              <fieldset className="grid grid-cols-2 gap-2">
                {[['student', "O'quvchi"], ['cook', 'Oshpaz (tasdiq bilan)']].map(([v, l]) => (
                  <label key={v} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight ring-1 sm:px-3 sm:text-sm ${f.role === v ? 'bg-teal text-white ring-teal' : 'ring-ink/15'}`}>
                    <input type="radio" className="sr-only" name="role" checked={f.role === v} onChange={() => setF((p) => ({ ...p, role: v }))} />{l}
                  </label>
                ))}
              </fieldset>
              <label className="block text-sm font-semibold">Ism<input className={INPUT} value={f.full_name} onChange={set('full_name')} autoComplete="name" /></label>
              <label className="block text-sm font-semibold">Telefon<input className={INPUT} placeholder="+998 90 000 00 00" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
              {f.role === 'student' && (
                <label className="block text-sm font-semibold">Nechanchi sinf?
                  <select className={INPUT} value={f.grade} onChange={set('grade')}>
                    <option value="">Sinfni tanlang</option>
                    {Array.from({ length: 11 }, (_, i) => i + 1).map((grade) => (
                      <option key={grade} value={grade}>{grade}-sinf</option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}
          <label className="block text-sm font-semibold">Email<input type="email" className={INPUT} value={f.email} onChange={set('email')} autoComplete="email" /></label>
          <label className="block text-sm font-semibold">Parol<input type="password" className={INPUT} value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={5} /></label>
          <button disabled={busy} className={`${BTN.primary} w-full`}>{busy ? 'Kuting...' : mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}</button>
          <button type="button" className="w-full text-sm font-semibold text-teal hover:underline" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); setSuccess('') }}>
            {mode === 'login' ? "Akkaunt yo'qmi? Ro'yxatdan o'ting" : 'Akkauntingiz bormi? Kiring'}
          </button>
        </form>
      </div>
    </main>
  )
}
