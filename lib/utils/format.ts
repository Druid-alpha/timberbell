export function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}
<<<<<<< HEAD

export function formatPdfMoney(amount: number) {
  return `NGN ${new Intl.NumberFormat('en-NG', {
    maximumFractionDigits: 0,
  }).format(amount)}`
}
=======
>>>>>>> e7cd282d2482ffba0f0273ec98994b171c5c5efe
