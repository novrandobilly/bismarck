import { useState } from 'react'

export function useVerifyPhone(whatsapp: string) {
  const [error, setError] = useState<string | null>(null)

  function verify(last4: string): boolean {
    const digits = whatsapp.replace(/\D/g, '')
    if (digits.endsWith(last4)) {
      setError(null)
      return true
    }
    setError("That doesn't match. Try again.")
    return false
  }

  return { verify, error }
}
