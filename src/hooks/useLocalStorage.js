import { useEffect, useState } from 'react'

// localStorage faqat savatcha uchun
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* saqlab bo'lmasa ham ilova ishlayveradi */
    }
  }, [key, value])
  return [value, setValue]
}
