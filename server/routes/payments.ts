import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

const ALATPAY_API_KEY = process.env.ALATPAY_API_KEY || '';
const ALATPAY_BUSINESS_ID = process.env.ALATPAY_BUSINESS_ID || '';
const ALATPAY_BASE_URL = process.env.ALATPAY_BASE_URL || 'https://api.alatpay.ng/v1';

// Initiate ALATPay checkout for a paid course
router.post('/checkout', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { course_id } = req.body;

  if (!course_id) {
    return res.status(400).json({ error: 'Course ID is required.' });
  }

  const courseStmt = db.prepare('SELECT * FROM courses WHERE id = ? OR slug = ?');
  const course = courseStmt.get(course_id, course_id) as any;

  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  if (course.price <= 0) {
    return res.status(400).json({ error: 'This course is free. Please enroll directly without checkout.' });
  }

  // Check if user already enrolled
  const enrolledStmt = db.prepare('SELECT 1 FROM course_enrolments WHERE user_id = ? AND course_id = ?');
  if (enrolledStmt.get(userId, course.id)) {
    return res.status(400).json({ error: 'You are already enrolled in this course.' });
  }

  // Create unique order reference
  const reference = 'CV_ORDER_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const insertOrder = db.prepare(`
    INSERT INTO orders (id, user_id, course_id, reference, amount, currency, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `);
  insertOrder.run(orderId, userId, course.id, reference, course.price, course.currency || 'NGN');

  const insertPayment = db.prepare(`
    INSERT INTO payments (id, order_id, provider, provider_reference, amount, currency, status)
    VALUES (?, ?, 'alatpay', ?, ?, ?, 'pending')
  `);
  const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  insertPayment.run(paymentId, orderId, reference, course.price, course.currency || 'NGN');

  const isConfigured = Boolean(ALATPAY_API_KEY && ALATPAY_BUSINESS_ID);

  if (!isConfigured) {
    return res.json({
      status: 'pending_configuration',
      message: 'ALATPay order created. Live payment credentials (ALATPAY_API_KEY, ALATPAY_BUSINESS_ID) are currently pending in the server environment.',
      order: {
        id: orderId,
        reference,
        amount: course.price,
        currency: course.currency || 'NGN',
        course_title: course.title,
      },
      provider_configured: false,
      instructions: 'To process live payments via ALATPay, configure ALATPAY_API_KEY and ALATPAY_BUSINESS_ID in your .env file.',
    });
  }

  // When live ALATPay credentials are configured:
  try {
    const alatPayPayload = {
      businessId: ALATPAY_BUSINESS_ID,
      amount: course.price,
      currency: course.currency || 'NGN',
      orderId: reference,
      description: `CultureVerse: ${course.title}`,
      customerEmail: req.user!.email,
      customerName: req.user!.full_name,
    };

    const response = await fetch(`${ALATPAY_BASE_URL}/checkout/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': ALATPAY_API_KEY,
      },
      body: JSON.stringify(alatPayPayload),
    });

    const data = await response.json();

    return res.json({
      status: 'success',
      order: {
        id: orderId,
        reference,
        amount: course.price,
        currency: course.currency || 'NGN',
        course_title: course.title,
      },
      checkout_url: data?.checkoutUrl || null,
      provider_configured: true,
    });
  } catch (err: any) {
    console.error('ALATPay API initiation error:', err);
    return res.status(502).json({
      error: 'Failed to communicate with ALATPay payment gateway.',
      order: { id: orderId, reference, amount: course.price },
    });
  }
});

// Check or verify payment status
router.get('/:reference/status', requireAuth, async (req: AuthRequest, res) => {
  const { reference } = req.params;

  const orderStmt = db.prepare(`
    SELECT o.*, crs.title as course_title, p.id as payment_id, p.status as payment_status
    FROM orders o
    JOIN courses crs ON o.course_id = crs.id
    LEFT JOIN payments p ON p.order_id = o.id
    WHERE o.reference = ?
  `);
  const order = orderStmt.get(reference) as any;

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const isConfigured = Boolean(ALATPAY_API_KEY);

  // If live credentials, query ALATPay verification endpoint
  if (isConfigured && order.status === 'pending') {
    try {
      const verifyRes = await fetch(`${ALATPAY_BASE_URL}/transaction/verify/${reference}`, {
        headers: { 'Ocp-Apim-Subscription-Key': ALATPAY_API_KEY },
      });
      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        if (verifyData.status === 'success' || verifyData.transactionStatus === 'Completed') {
          // Idempotent order update & course enrolment
          db.prepare("UPDATE orders SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(order.id);
          db.prepare("UPDATE payments SET status = 'successful', verified_at = CURRENT_TIMESTAMP WHERE order_id = ?").run(order.id);

          const enrolId = 'enr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
          db.prepare(`
            INSERT OR IGNORE INTO course_enrolments (id, user_id, course_id, payment_status)
            VALUES (?, ?, ?, 'completed')
          `).run(enrolId, order.user_id, order.course_id);

          order.status = 'paid';
          order.payment_status = 'successful';
        }
      }
    } catch (vErr) {
      console.warn('ALATPay verification query failed:', vErr);
    }
  }

  return res.json({
    order,
    provider_configured: isConfigured,
  });
});

// ALATPay Webhook for asynchronous transaction callbacks
router.post('/webhook', (req, res) => {
  const { reference, status, transactionId } = req.body;

  if (!reference) {
    return res.status(400).json({ error: 'Missing reference.' });
  }

  const orderStmt = db.prepare('SELECT * FROM orders WHERE reference = ?');
  const order = orderStmt.get(reference) as any;

  if (!order) {
    return res.status(404).json({ error: 'Order reference not recognized.' });
  }

  if (status === 'successful' || status === 'Completed') {
    db.prepare("UPDATE orders SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(order.id);
    db.prepare(`
      UPDATE payments
      SET status = 'successful', provider_reference = ?, verified_at = CURRENT_TIMESTAMP
      WHERE order_id = ?
    `).run(transactionId || reference, order.id);

    // Grant course enrollment idempotently
    const enrolId = 'enr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    db.prepare(`
      INSERT OR IGNORE INTO course_enrolments (id, user_id, course_id, payment_status)
      VALUES (?, ?, ?, 'completed')
    `).run(enrolId, order.user_id, order.course_id);

    return res.json({ received: true, verified: true });
  }

  return res.json({ received: true, verified: false });
});

export default router;
