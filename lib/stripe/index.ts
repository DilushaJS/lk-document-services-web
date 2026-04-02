import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export const PACKAGE_PRICES: Record<string, number> = {
  basic: 100,
  standard: 150,
  premium: 750,
}

export const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Basic Formation Package',
  standard: 'Standard Formation + EIN Package',
  premium: 'Premium Compliance Package',
}