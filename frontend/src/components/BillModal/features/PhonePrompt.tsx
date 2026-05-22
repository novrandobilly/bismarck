import { useState } from 'react'
import { BismarckButton } from '@/components/BismarckButton'

interface Props {
  onVerify: (last4: string) => void
  onCancel: () => void
  error: string | null
}

export function PhonePrompt({ onVerify, onCancel, error }: Props) {
  const [value, setValue] = useState('')

  return (
    <div className="p-6">
      <h2 className="font-bold text-stone-900 text-base mb-1">View Your Bill</h2>
      <p className="text-xs text-stone-400 mb-4">
        Enter the last 4 digits of your WhatsApp number to continue.
      </p>
      <input
        type="tel"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
        placeholder="_ _ _ _"
        className="w-full border border-stone-300 rounded-lg py-2.5 px-3 text-center text-xl tracking-widest font-bold text-stone-800 focus:outline-none focus:border-amber-400 mb-1"
        aria-label="Last 4 digits of WhatsApp number"
      />
      <div className="h-4 mb-2">
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <BismarckButton
        size="full"
        onClick={() => onVerify(value)}
        disabled={value.length !== 4}
      >
        Verify →
      </BismarckButton>
      <button
        type="button"
        onClick={onCancel}
        className="w-full text-stone-400 text-sm py-2 mt-1 hover:text-stone-600 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
