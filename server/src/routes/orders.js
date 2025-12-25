/**
 * Orders Routes
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const edxService = require('../services/edx');

const router = express.Router();

// Generate order reference ID
const generateOrderReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().substring(0, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      items,
      billingInfo,
      paymentMethod,
      mobileProvider,
      subtotal,
      discount = 0,
      promoCode,
      total,
    } = req.body;

    if (!items || !items.length || !paymentMethod || !total) {
      return res.status(400).json({
        message: 'Items, payment method, and total are required',
      });
    }

    const referenceId = generateOrderReference();

    // Map payment method to enum
    const paymentMethodMap = {
      mobile_money: 'MOBILE_MONEY',
      card: 'CARD',
      bank_transfer: 'BANK_TRANSFER',
      pay_at_center: 'PAY_AT_CENTER',
    };

    // Create order with items
    const order = await req.prisma.order.create({
      data: {
        referenceId,
        userId: req.user.id,
        status: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethodMap[paymentMethod] || 'MOBILE_MONEY',
        subtotal,
        discount,
        total,
        promoCode,
        mobileProvider,
        billingFirstName: billingInfo?.firstName,
        billingLastName: billingInfo?.lastName,
        billingEmail: billingInfo?.email,
        billingPhone: billingInfo?.phone,
        billingCountry: billingInfo?.country,
        items: {
          create: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: 1,
            ...(item.type === 'track' && { trackId: item.id }),
            ...(item.type === 'course' && { courseId: item.id }),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      success: true,
      order: {
        ...order,
        paymentMethod,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders
 * Get user's orders
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {
      userId: req.user.id,
      ...(status && { status: status.toUpperCase() }),
    };

    const [orders, total] = await Promise.all([
      req.prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      orders,
      total,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/:referenceId
 * Get order by reference ID
 */
router.get('/:referenceId', authenticate, async (req, res, next) => {
  try {
    const { referenceId } = req.params;

    const order = await req.prisma.order.findFirst({
      where: {
        referenceId,
        userId: req.user.id,
      },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/orders/:referenceId/payment
 * Update order payment status
 */
router.patch('/:referenceId/payment', authenticate, async (req, res, next) => {
  try {
    const { referenceId } = req.params;
    const {
      status,
      transactionId,
      issuerTransactionId,
      waafipayOrderId,
      payerId,
      errorCode,
      errorMessage,
    } = req.body;

    // Find order
    const order = await req.prisma.order.findFirst({
      where: {
        referenceId,
        userId: req.user.id,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Map status to enum
    const statusMap = {
      approved: 'APPROVED',
      pending: 'PENDING',
      declined: 'DECLINED',
      failed: 'FAILED',
      cancelled: 'CANCELLED',
      expired: 'EXPIRED',
      timeout: 'TIMEOUT',
    };

    const paymentStatus = statusMap[status?.toLowerCase()] || 'PENDING';
    const orderStatus = paymentStatus === 'APPROVED' ? 'COMPLETED' : 'FAILED';

    // Update order
    const updatedOrder = await req.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        status: orderStatus,
      },
      include: {
        items: true,
      },
    });

    // Create payment record
    if (transactionId || status) {
      await req.prisma.payment.create({
        data: {
          orderId: order.id,
          userId: req.user.id,
          amount: order.total,
          currency: order.currency,
          status: paymentStatus,
          paymentMethod: order.paymentMethod,
          transactionId,
          issuerTransactionId,
          waafipayOrderId,
          payerId,
          errorCode,
          errorMessage,
          ...(paymentStatus === 'APPROVED' && { paidAt: new Date() }),
        },
      });
    }

    // Create enrollments and trigger edX enrollment if payment approved
    if (paymentStatus === 'APPROVED') {
      const orderItems = await req.prisma.orderItem.findMany({
        where: { orderId: order.id },
        include: {
          course: true,
          track: {
            include: {
              courses: true,
            },
          },
        },
      });

      // Get user details for edX registration
      const user = await req.prisma.user.findUnique({
        where: { id: req.user.id },
      });

      // Ensure user is registered on edX
      let edxUsername = user.edxUsername;
      if (!user.edxRegistered) {
        try {
          const edxRegResult = await edxService.registerUser({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          });

          if (edxRegResult.success) {
            edxUsername = edxRegResult.username;
            await req.prisma.user.update({
              where: { id: user.id },
              data: {
                edxUsername: edxRegResult.username,
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
      for (const item of orderItems) {
        // If it's a track, enroll in all courses of the track
        if (item.trackId && item.track) {
          // Create track enrollment
          await req.prisma.enrollment.create({
            data: {
              userId: req.user.id,
              trackId: item.trackId,
              status: 'active',
            },
          });

          // Enroll in each course of the track
          for (const course of item.track.courses || []) {
            const enrollment = await req.prisma.enrollment.create({
              data: {
                userId: req.user.id,
                courseId: course.id,
                status: 'active',
                edxCourseId: course.edxCourseId,
              },
            });

            // Enroll on edX if course has edX ID
            if (course.edxCourseId && edxUsername) {
              try {
                const edxEnrollResult = await edxService.enrollUserInCourse({
                  username: edxUsername,
                  email: user.email,
                  courseId: course.edxCourseId,
                  mode: 'honor',
                });

                if (edxEnrollResult.success) {
                  await req.prisma.enrollment.update({
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

        // If it's a single course
        if (item.courseId && item.course) {
          const enrollment = await req.prisma.enrollment.create({
            data: {
              userId: req.user.id,
              courseId: item.courseId,
              status: 'active',
              edxCourseId: item.course.edxCourseId,
            },
          });

          // Enroll on edX if course has edX ID
          if (item.course.edxCourseId && edxUsername) {
            try {
              const edxEnrollResult = await edxService.enrollUserInCourse({
                username: edxUsername,
                email: user.email,
                courseId: item.course.edxCourseId,
                mode: 'honor',
              });

              if (edxEnrollResult.success) {
                await req.prisma.enrollment.update({
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

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/orders/:referenceId/cancel
 * Cancel an order
 */
router.patch('/:referenceId/cancel', authenticate, async (req, res, next) => {
  try {
    const { referenceId } = req.params;

    const order = await req.prisma.order.findFirst({
      where: {
        referenceId,
        userId: req.user.id,
        status: { in: ['PENDING', 'PENDING_PAYMENT'] },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found or cannot be cancelled',
      });
    }

    const updatedOrder = await req.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'CANCELLED',
      },
    });

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
