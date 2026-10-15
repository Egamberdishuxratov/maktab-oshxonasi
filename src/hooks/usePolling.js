import { useCallback, useEffect, useRef, useState } from 'react'
import { niceError } from '../lib/errors'

// Ma'lumotni har `ms` millisekundda qayta o'qiydi; boshqa oynada o'zgarish bo'lsa darrov yangilaydi
export function usePolling(fetcher, ms = 3000) {
  const [state, setState] = useState({ data: null, error: '', loading: true })
  const ref = useRef(fetcher)
  useEffect(() => {
    ref.current = fetcher
  })
  const run = useCallback(async () => {
    try {
      const data = await ref.current()
      setState({ data, error: '', loading: false })
    } catch (e) {
      setState((s) => ({ ...s, error: niceError(e), loading: false }))
    }
  }, [])
  useEffect(() => {
    run()
    const id = setInterval(run, ms)
    window.addEventListener('storage', run)
    return () => {
      clearInterval(id)
      window.removeEventListener('storage', run)
    }
  }, [run, ms])
  return { ...state, reload: run }
}
