import { useState } from 'react'
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
  const { data: order, isLoading } = useOrderBill(orderId)
  const { verify, error } = useVerifyPhone(order?.whatsapp ?? '')

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

  if (!order) return null

  if (verified) {
    return <BillDetail order={order} onClose={close} />
  }

  return <PhonePrompt onVerify={handleVerify} onCancel={close} error={error} />
}
