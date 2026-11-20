export interface RazorpayCheckoutInput {
  amountInRupees: number;
  purpose: 'membership' | 'refill';
  description: string;
  receipt?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
}

export interface VerifiedPaymentResult {
  verified: boolean;
  razorpay_payment_id: string;
  razorpay_order_id: string;
}

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  key?: string;
  error?: string;
}

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (resp: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export function loadRazorpayCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay Checkout requires a browser environment.'));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Razorpay Checkout script.')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Unable to load Razorpay Checkout. Check your network connection.'));
    document.body.appendChild(script);
  });
}

export async function initiateUpiFirstRazorpayPayment(
  input: RazorpayCheckoutInput
): Promise<VerifiedPaymentResult> {
  const orderRes = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: input.amountInRupees,
      purpose: input.purpose,
      receipt: input.receipt,
      notes: input.notes,
    }),
  });

  const orderData = (await orderRes.json().catch(() => ({}))) as RazorpayOrderResponse;
  if (!orderRes.ok || !orderData.id) {
    throw new Error(
      orderData.error || 'Could not initialize Razorpay order. Check server configuration.'
    );
  }

  await loadRazorpayCheckoutScript();

  if (!window.Razorpay) {
    throw new Error('Razorpay Checkout failed to initialize in the browser.');
  }

  const checkoutKey = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim() || orderData.key;
  if (!checkoutKey) {
    throw new Error(
      'Missing VITE_RAZORPAY_KEY_ID or server RAZORPAY_KEY_ID for Razorpay Checkout.'
    );
  }

  return new Promise<VerifiedPaymentResult>((resolve, reject) => {
    let settled = false;

    const rzp = new window.Razorpay!({
      key: checkoutKey,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      order_id: orderData.id,
      name: 'DawaiDost',
      description: input.description,
      prefill: {
        name: input.prefill?.name || '',
        email: input.prefill?.email || '',
        contact: input.prefill?.contact || '',
      },
      notes: {
        purpose: input.purpose,
        ...input.notes,
      },
      theme: {
        color: '#0F766E',
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay via GPay, Paytm, PhonePe or UPI QR',
              instruments: [
                {
                  method: 'upi',
                  flows: ['intent', 'collect', 'qr'],
                  apps: ['google_pay', 'paytm', 'phonepe'],
                },
              ],
            },
            other: {
              name: 'Cards & Netbanking',
              instruments: [
                { method: 'card' },
                { method: 'netbanking' },
              ],
            },
          },
          sequence: ['block.upi', 'block.other'],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
      modal: {
        ondismiss: () => {
          if (!settled) {
            settled = true;
            reject(new Error('Payment checkout was cancelled before completion.'));
          }
        },
      },
      handler: async (response: RazorpayHandlerResponse) => {
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              purpose: input.purpose,
            }),
          });

          const verifyData = (await verifyRes.json().catch(() => ({}))) as {
            verified?: boolean;
            razorpay_payment_id?: string;
            razorpay_order_id?: string;
            error?: string;
          };

          if (!verifyRes.ok || !verifyData.verified) {
            throw new Error(verifyData.error || 'Razorpay payment signature verification failed.');
          }

          if (!settled) {
            settled = true;
            resolve({
              verified: true,
              razorpay_payment_id:
                verifyData.razorpay_payment_id || response.razorpay_payment_id,
              razorpay_order_id: verifyData.razorpay_order_id || response.razorpay_order_id,
            });
          }
        } catch (err) {
          if (!settled) {
            settled = true;
            reject(
              err instanceof Error
                ? err
                : new Error('Payment verification failed on the server.')
            );
          }
        }
      },
    });

    rzp.on('payment.failed', (failureResp) => {
      if (!settled) {
        settled = true;
        reject(
          new Error(
            failureResp?.error?.description ||
              'UPI / Razorpay payment failed. Please try again.'
          )
        );
      }
    });

    rzp.open();
  });
}
