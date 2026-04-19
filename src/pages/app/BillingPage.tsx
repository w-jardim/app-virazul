import React from 'react'
import {
  useBilling,
  useCheckoutPremium,
  usePixCharge,
  useCancelSubscription
} from '@/features/billing/hooks/useBilling'

const BillingPage: React.FC = () => {
  const { data, isLoading } = useBilling()
  const checkout = useCheckoutPremium()
  const pix = usePixCharge()
  const cancel = useCancelSubscription()

  if (isLoading) return <div>Carregando...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Assinatura</h1>

      <div className="p-4 border rounded-lg bg-white">
        <p><b>Plano:</b> {data?.plan_name}</p>
        <p><b>Status:</b> {data?.status}</p>
        <p><b>Próxima cobrança:</b> {data?.next_billing_at || '-'}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={async () => {
            const res = await checkout.mutateAsync()
            window.location.href = res.checkout_url
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Assinar Premium
        </button>

        <button
          onClick={async () => {
            const res = await pix.mutateAsync()
            alert(res.qr_code || 'PIX gerado')
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Pagar com Pix
        </button>

        <button
          onClick={() => cancel.mutate()}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default BillingPage
