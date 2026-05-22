import { useState, useEffect } from 'react'
import { useOrderBill } from './hooks/useOrderBill'
import { useVerifyPhone } from './hooks/useVerifyPhone'
import { PhonePrompt } from './features/PhonePrompt'
import { BillDetail } from './features/BillDetail'
import { useModal } from '@/lib/modal/useModal'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface Props {
  orderId: string
}

export function BillModal({ orderId }: Props) {
  const [verified, setVerified] = useState(false)
  const { close } = useModal()
  const { data: order, isLoading, isError } = useOrderBill(orderId)
  const { verify, error } = useVerifyPhone(order?.whatsapp ?? '')

  useEffect(() => {
    setVerified(false)
  }, [orderId])

  function handleVerify(last4: string) {
    if (verify(last4)) setVerified(true)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="p-6 text-center">
        <p className="text-stone-500 text-sm mb-4">Couldn't load your bill. Please try again.</p>
        <button
          type="button"
          onClick={close}
          className="text-stone-400 text-sm hover:text-stone-600 transition-colors"
        >
          Close
        </button>
      </div>
    )
  }

  if (verified) {
    return <BillDetail order={order} onClose={close} />
  }

  return <PhonePrompt onVerify={handleVerify} onCancel={close} error={error} />
}
