import crypto from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ verified: false, error: 'Method not allowed' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keySecret) {
    return res.status(503).json({
      verified: false,
      error: 'RAZORPAY_KEY_SECRET is not configured on the server.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string' ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        verified: false,
        error: 'Missing required Razorpay payment verification fields.',
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(razorpay_signature, 'utf8');

    const isSignatureValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isSignatureValid) {
      return res.status(400).json({
        verified: false,
        error: 'Payment signature verification failed.',
      });
    }

    return res.status(200).json({
      verified: true,
      razorpay_payment_id,
      razorpay_order_id,
    });
  } catch (error) {
    return res.status(500).json({
      verified: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unexpected error while verifying Razorpay signature.',
    });
  }
}
