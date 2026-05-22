export function formatRupiah(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new Error('Invalid amount: must be a finite number')
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
