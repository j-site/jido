import Stripe from 'stripe'

// Stripe署名検証には生のリクエストボディが必要
export const config = { api: { bodyParser: false } }

const rawBody = (req) => new Promise((resolve, reject) => {
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => resolve(Buffer.concat(chunks)))
  req.on('error', reject)
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  let event

  try {
    const body = await rawBody(req)
    event = stripe.webhooks.constructEvent(body, req.headers['stripe-signature'], secret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'invalid signature' })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object
      console.log(`✅ 新規登録: ${s.customer_email || s.customer_details?.email} (customer: ${s.customer})`)
      break
    }
    case 'invoice.payment_failed': {
      const inv = event.data.object
      console.log(`⚠️ 決済失敗: customer ${inv.customer}`)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      console.log(`🛑 解約: customer ${sub.customer}`)
      break
    }
    default:
      break
  }

  return res.status(200).json({ received: true })
}
