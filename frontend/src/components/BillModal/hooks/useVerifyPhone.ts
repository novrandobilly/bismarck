import { useState } from 'react'

export function useVerifyPhone(whatsapp: string) {
  const [error, setError] = useState<string | null>(null)

  function verify(last4: string): boolean {
    const last4Digits = last4.replace(/\D/g, '')
    if (last4Digits.length !== 4) {
      setError('Please enter 4 digits.')
      return false
    }
    if (!whatsapp) {
      setError("Couldn't verify. Try again.")
      return false
    }
    const digits = whatsapp.replace(/\D/g, '')
    if (digits.endsWith(last4Digits)) {
      setError(null)
      return true
    }
    setError("That doesn't match. Try again.")
    return false
  }

  return { verify, error }
}
