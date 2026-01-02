/**
 * Payments Routes
 * Handles WaafiPay HPP payment initiation and callbacks
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const waafipayService = require('../services/waafipay');
const edxService = require('../services/edx');

const router = express.Router();

/**
 * GET /api/payments
 * Get user's payment history
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {
      userId: req.user.id,
      ...(status && { status: status.toUpperCase() }),
    };

    const [payments, total] = await Promise.all([
      req.prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              items: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      payments,
      total,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments/status
 * Test WaafiPay connection
 */
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const result = await waafipayService.testConnection();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments/:id
 * Get payment by ID
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await req.prisma.payment.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/initiate
 * Initiate WaafiPay HPP payment
 */
router.post('/initiate', authenticate, async (req, res, next) => {
  try {
    const {
      orderReferenceId,
      payerPhone,
      paymentMethod = 'MWALLET_ACCOUNT',
    } = req.body;

    if (!orderReferenceId) {
      return res.status(400).json({ message: 'Order reference ID is required' });
    }

    // Find the order
    const order = await req.prisma.order.findFirst({
      where: {
        referenceId: orderReferenceId,
        userId: req.user.id,
        status: { in: ['PENDING', 'PENDING_PAYMENT'] },
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or already processed' });
    }

    // Build callback URLs
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL?.replace('/api', '') || 'http://localhost:8000';
    const successUrl = `${frontendUrl}/payment/callback?status=success&ref=${orderReferenceId}`;
    const failureUrl = `${frontendUrl}/payment/callback?status=failure&ref=${orderReferenceId}`;
    // Server-to-server callback URL for reliable payment status updates
    const callbackUrl = `${backendUrl}/api/payments/callback`;

    // Build description from order items
    const itemNames = order.items.map((item) => item.name).join(', ');
    const description = `Tabsera Academy: ${itemNames}`.substring(0, 100);

    // Initiate WaafiPay payment
    const result = await waafipayService.initiatePurchase({
      referenceId: order.referenceId,
      amount: parseFloat(order.total),
      currency: order.currency || 'USD',
      description,
      payerPhone,
      paymentMethod,
      successUrl,
      failureUrl,
      callbackUrl, // Server-to-server callback
    });

    if (result.success) {
      // Update order with WaafiPay transaction ID
      await req.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PENDING_PAYMENT',
        },
      });

      // Create pending payment record
      await req.prisma.payment.create({
        data: {
          orderId: order.id,
          userId: req.user.id,
          amount: order.total,
          currency: order.currency || 'USD',
          status: 'PENDING',
          paymentMethod: order.paymentMethod,
          waafipayOrderId: result.orderId,
          transactionId: result.transactionId,
        },
      });

      res.json({
        success: true,
        hppUrl: result.hppUrl,
        orderId: result.orderId,
        transactionId: result.transactionId,
        referenceId: order.referenceId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.errorMessage || 'Payment initiation failed',
        errorCode: result.errorCode,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/hpp
 * Initiate HPP (Hosted Payment Page) - redirects user to WaafiPay payment page
 */
router.post('/hpp', authenticate, async (req, res, next) => {
  try {
    const { orderReferenceId, payerPhone } = req.body;

    if (!orderReferenceId) {
      return res.status(400).json({
        message: 'Order reference ID is required',
      });
    }

    // Find the order
    const order = await req.prisma.order.findFirst({
      where: {
        referenceId: orderReferenceId,
        userId: req.user.id,
        status: { in: ['PENDING', 'PENDING_PAYMENT'] },
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or already processed' });
    }

    // Build callback URLs
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL?.replace('/api', '') || 'http://localhost:8000';
    const successUrl = `${frontendUrl}/payment/callback?status=success&ref=${order.referenceId}`;
    const failureUrl = `${frontendUrl}/payment/callback?status=failure&ref=${order.referenceId}`;
    // Server-to-server callback URL for reliable payment status updates
    const callbackUrl = `${backendUrl}/api/payments/callback`;

    // Build description from order items
    const itemNames = order.items.map((item) => item.name).join(', ');
    const description = `Tabsera Academy: ${itemNames}`.substring(0, 100);

    // Initiate HPP payment (redirects to WaafiPay payment page)
    const result = await waafipayService.initiatePurchase({
      referenceId: order.referenceId,
      amount: parseFloat(order.total),
      currency: order.currency || 'USD',
      description,
      payerPhone,
      paymentMethod: 'MWALLET_ACCOUNT',
      successUrl,
      failureUrl,
      callbackUrl, // Server-to-server callback
    });

    if (result.success && result.hppUrl) {
      // Update order status
      await req.prisma.order.update({
        where: { id: order.id },
        data: { status: 'PENDING_PAYMENT' },
      });

      // Create pending payment record
      await req.prisma.payment.create({
        data: {
          orderId: order.id,
          userId: req.user.id,
          amount: order.total,
          currency: order.currency || 'USD',
          status: 'PENDING',
          paymentMethod: order.paymentMethod,
          waafipayOrderId: result.orderId,
          transactionId: result.transactionId,
        },
      });

      res.json({
        success: true,
        hppUrl: result.hppUrl,
        orderId: result.orderId,
        referenceId: order.referenceId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.errorMessage || 'Failed to initiate payment',
        errorCode: result.errorCode,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/callback
 * Handle WaafiPay HPP callback (server-to-server)
 * This endpoint receives payment status updates from WaafiPay
 */
router.post('/callback', async (req, res, next) => {
  try {
    console.log('=== WaafiPay Server Callback Received ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));

    const callbackData = waafipayService.parseCallback(req.body);
    let { referenceId, transactionId, state } = callbackData;

    // Clean referenceId - WaafiPay sometimes appends query params to the reference
    if (referenceId && referenceId.includes('?')) {
      referenceId = referenceId.split('?')[0];
    }

    if (!referenceId) {
      return res.status(400).json({ message: 'Reference ID is required' });
    }

    // Find the order by reference ID
    const order = await req.prisma.order.findFirst({
      where: { referenceId },
      include: {
        items: {
          include: {
            course: true,
            track: {
              include: {
                courses: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!order) {
      console.error('Order not found for callback:', referenceId);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Map WaafiPay state to our payment status
    const statusMap = {
      APPROVED: 'APPROVED',
      DECLINED: 'DECLINED',
      CANCELLED: 'CANCELLED',
      PENDING: 'PENDING',
      EXPIRED: 'EXPIRED',
    };

    const paymentStatus = statusMap[state] || 'FAILED';
    const orderStatus = paymentStatus === 'APPROVED' ? 'COMPLETED' : 'FAILED';

    // Update order status
    await req.prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        paymentStatus,
      },
    });

    // Update or create payment record
    const existingPayment = await req.prisma.payment.findFirst({
      where: { orderId: order.id },
    });

    if (existingPayment) {
      await req.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: paymentStatus,
          transactionId,
          issuerTransactionId: callbackData.issuerTransactionId,
          payerId: callbackData.payerId,
          ...(paymentStatus === 'APPROVED' && { paidAt: new Date() }),
        },
      });
    } else {
      await req.prisma.payment.create({
        data: {
          orderId: order.id,
          userId: order.userId,
          amount: order.total,
          currency: order.currency,
          status: paymentStatus,
          paymentMethod: order.paymentMethod,
          transactionId,
          issuerTransactionId: callbackData.issuerTransactionId,
          payerId: callbackData.payerId,
          ...(paymentStatus === 'APPROVED' && { paidAt: new Date() }),
        },
      });
    }

    // If payment approved, create enrollments and sync with edX
    if (paymentStatus === 'APPROVED') {
      console.log(`Processing enrollments for order ${referenceId}...`);
      await processEnrollments(req.prisma, order);
      console.log(`Enrollments processed for order ${referenceId}`);
    }

    console.log(`=== WaafiPay Callback Complete: Order ${referenceId} updated to ${orderStatus} ===`);
    res.json({ success: true, status: paymentStatus });
  } catch (error) {
    console.error('WaafiPay callback error:', error);
    next(error);
  }
});

/**
 * GET /api/payments/verify/:referenceId
 * Verify payment status by order reference
 * Query params:
 *   - callbackStatus: Status from WaafiPay callback URL (success/failure)
 */
router.get('/verify/:referenceId', authenticate, async (req, res, next) => {
  try {
    let { referenceId } = req.params;
    const { callbackStatus } = req.query;

    // Clean referenceId - WaafiPay sometimes appends query params to the reference
    if (referenceId && referenceId.includes('?')) {
      referenceId = referenceId.split('?')[0];
    }

    // Find order
    const order = await req.prisma.order.findFirst({
      where: {
        referenceId,
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            course: true,
            track: { include: { courses: true } },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If order is already completed, return success
    if (order.status === 'COMPLETED' && order.paymentStatus === 'APPROVED') {
      return res.json({
        success: true,
        verified: true,
        status: 'APPROVED',
        order,
      });
    }

    const latestPayment = order.payments[0];

    // If WaafiPay callback indicated success, mark payment as approved
    // This handles HPP payments where transactionId may not be available
    if (callbackStatus === 'success' && order.status !== 'COMPLETED') {
      console.log(`Marking order ${referenceId} as completed based on WaafiPay callback`);

      // Update order status
      await req.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          paymentStatus: 'APPROVED',
        },
      });

      // Update payment record if exists
      if (latestPayment) {
        await req.prisma.payment.update({
          where: { id: latestPayment.id },
          data: {
            status: 'APPROVED',
            paidAt: new Date(),
          },
        });
      } else {
        // Create payment record if doesn't exist
        await req.prisma.payment.create({
          data: {
            orderId: order.id,
            userId: req.user.id,
            amount: order.total,
            currency: order.currency || 'USD',
            status: 'APPROVED',
            paymentMethod: order.paymentMethod,
            paidAt: new Date(),
          },
        });
      }

      // Process enrollments
      await processEnrollments(req.prisma, order);

      return res.json({
        success: true,
        verified: true,
        status: 'APPROVED',
        order: {
          ...order,
          status: 'COMPLETED',
          paymentStatus: 'APPROVED',
        },
      });
    }

    // If payment is pending and we have a transactionId, check with WaafiPay
    if (latestPayment && latestPayment.transactionId && latestPayment.status === 'PENDING') {
      try {
        const transactionInfo = await waafipayService.getTransactionInfo(latestPayment.transactionId);

        if (transactionInfo.success && transactionInfo.state !== 'PENDING') {
          // Update payment status
          const statusMap = {
            APPROVED: 'APPROVED',
            DECLINED: 'DECLINED',
            CANCELLED: 'CANCELLED',
            EXPIRED: 'EXPIRED',
          };

          const newStatus = statusMap[transactionInfo.state] || 'FAILED';
          const orderStatus = newStatus === 'APPROVED' ? 'COMPLETED' : 'FAILED';

          await req.prisma.payment.update({
            where: { id: latestPayment.id },
            data: {
              status: newStatus,
              issuerTransactionId: transactionInfo.issuerTransactionId,
              payerId: transactionInfo.payerId,
              ...(newStatus === 'APPROVED' && { paidAt: new Date() }),
            },
          });

          await req.prisma.order.update({
            where: { id: order.id },
            data: {
              status: orderStatus,
              paymentStatus: newStatus,
            },
          });

          // If approved, process enrollments
          if (newStatus === 'APPROVED') {
            await processEnrollments(req.prisma, order);
          }

          return res.json({
            success: true,
            verified: newStatus === 'APPROVED',
            status: newStatus,
            order: {
              ...order,
              status: orderStatus,
              paymentStatus: newStatus,
            },
          });
        }
      } catch (waafipayError) {
        console.error('WaafiPay verification error:', waafipayError);
        // Continue to return current order status
      }
    }

    res.json({
      success: true,
      verified: order.paymentStatus === 'APPROVED',
      status: order.paymentStatus || 'PENDING',
      order,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/refund/:paymentId
 * Process a refund (Admin only would typically be required)
 */
router.post('/refund/:paymentId', authenticate, async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await req.prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: req.user.id,
        status: 'APPROVED',
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found or not refundable' });
    }

    if (!payment.transactionId) {
      return res.status(400).json({ message: 'No transaction ID for refund' });
    }

    const refundAmount = amount || parseFloat(payment.amount);
    const result = await waafipayService.refund(
      payment.transactionId,
      refundAmount,
      reason || 'Customer requested refund'
    );

    if (result.success) {
      // Update payment status
      await req.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CANCELLED',
          errorMessage: `Refunded: ${reason || 'No reason provided'}`,
        },
      });

      // Update order status
      await req.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'CANCELLED',
        },
      });

      res.json({
        success: true,
        message: 'Refund processed successfully',
        refundTransactionId: result.refundTransactionId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.errorMessage || 'Refund failed',
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Helper: Process approved payment
 */
async function processApprovedPayment(prisma, order, paymentResult, userId) {
  // Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'COMPLETED',
      paymentStatus: 'APPROVED',
    },
  });

  // Create or update payment record
  await prisma.payment.create({
    data: {
      orderId: order.id,
      userId,
      amount: order.total,
      currency: order.currency || 'USD',
      status: 'APPROVED',
      paymentMethod: order.paymentMethod,
      transactionId: paymentResult.transactionId,
      issuerTransactionId: paymentResult.issuerTransactionId,
      paidAt: new Date(),
    },
  });

  // Get full order with items for enrollment
  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: {
        include: {
          course: true,
          track: { include: { courses: true } },
        },
      },
      user: true,
    },
  });

  await processEnrollments(prisma, fullOrder);
}

/**
 * Helper: Process enrollments after successful payment
 */
async function processEnrollments(prisma, order) {
  const user = order.user;

  // Ensure user is registered on edX
  let edxUsername = user.edxUsername;
  if (!user.edxRegistered) {
    try {
      // Generate edX credentials
      const { password, encryptedPassword } = edxService.createEdxCredentials(
        user.firstName,
        user.lastName
      );

      const edxRegResult = await edxService.registerUser({
        email: user.email,
        password: password,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      if (edxRegResult.success) {
        edxUsername = edxRegResult.username;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            edxUsername: edxRegResult.username,
            edxPassword: encryptedPassword, // Store encrypted password for auto-login
            edxRegistered: true,
            edxRegisteredAt: new Date(),
          },
        });
      }
    } catch (edxError) {
      console.error('edX registration failed:', edxError);
    }
  }

  // Process each order item
  for (const item of order.items) {
    // Track enrollment
    if (item.trackId && item.track) {
      await prisma.enrollment.create({
        data: {
          userId: user.id,
          trackId: item.trackId,
          status: 'active',
        },
      });

      // Enroll in each course of the track
      for (const course of item.track.courses || []) {
        const enrollment = await prisma.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            status: 'active',
            edxCourseId: course.edxCourseId,
          },
        });

        // Enroll on edX
        if (course.edxCourseId && edxUsername) {
          try {
            const edxEnrollResult = await edxService.enrollUserInCourse({
              username: edxUsername,
              email: user.email,
              courseId: course.edxCourseId,
              mode: 'honor',
            });

            if (edxEnrollResult.success) {
              await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: {
                  edxEnrolled: true,
                  edxEnrolledAt: new Date(),
                  edxEnrollmentMode: 'honor',
                },
              });
            }
          } catch (edxError) {
            console.error(`edX enrollment failed for course ${course.id}:`, edxError);
          }
        }
      }
    }

    // Single course enrollment
    if (item.courseId && item.course) {
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: item.courseId,
          status: 'active',
          edxCourseId: item.course.edxCourseId,
        },
      });

      // Enroll on edX
      if (item.course.edxCourseId && edxUsername) {
        try {
          const edxEnrollResult = await edxService.enrollUserInCourse({
            username: edxUsername,
            email: user.email,
            courseId: item.course.edxCourseId,
            mode: 'honor',
          });

          if (edxEnrollResult.success) {
            await prisma.enrollment.update({
              where: { id: enrollment.id },
              data: {
                edxEnrolled: true,
                edxEnrolledAt: new Date(),
                edxEnrollmentMode: 'honor',
              },
            });
          }
        } catch (edxError) {
          console.error(`edX enrollment failed for course ${item.courseId}:`, edxError);
        }
      }
    }
  }
}

module.exports = router;
