export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return res.status(503).json({
      error:
        'Razorpay server credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const rawAmountInRupees = Number(body.amount);
    const purpose = body.purpose === 'membership' ? 'membership' : 'refill';
    const receipt =
      typeof body.receipt === 'string' && body.receipt.trim()
        ? body.receipt.trim().slice(0, 40)
        : `dd_${purpose}_${Date.now()}`;

    if (!Number.isFinite(rawAmountInRupees) || rawAmountInRupees <= 0) {
      return res.status(400).json({ error: 'A valid positive INR amount is required.' });
    }

    const amountInPaise = Math.round(rawAmountInRupees * 100);
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          purpose,
          service: 'DawaiDost Chronic Care Coordination',
          ...(body.notes && typeof body.notes === 'object' ? body.notes : {}),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.description || 'Failed to create Razorpay order.',
      });
    }

    return res.status(200).json({
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      key: keyId,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unexpected error while creating Razorpay order.',
    });
  }
}
