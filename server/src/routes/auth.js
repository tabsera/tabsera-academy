/**
 * Authentication Routes
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { authenticate, generateToken } = require('../middleware/auth');
const { sendEmail } = require('../services/email');
const edxService = require('../services/edx');

const router = express.Router();

/**
 * Generate a secure random token
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate 6-digit verification code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Verify Your Email</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px; color: #374151;">Hi ${user.firstName},</p>
        <p style="font-size: 16px; color: #374151;">Thank you for registering with Tabsera Academy! Please verify your email address to activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #2563eb; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 14px; color: #2563eb; word-break: break-all;">${verificationUrl}</p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">This link will expire in 24 hours.</p>
        <p style="font-size: 14px; color: #6b7280;">If you didn't create an account with Tabsera Academy, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 14px; color: #6b7280;">Best regards,<br>Tabsera Academy Team</p>
      </div>
      <div style="padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; background: #f3f4f6;">
        <p>Tabsera Academy - Quality Education for Everyone</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email - Tabsera Academy',
    text: `Hi ${user.firstName},\n\nPlease verify your email by clicking this link: ${verificationUrl}\n\nThis link expires in 24 hours.\n\nBest regards,\nTabsera Academy Team`,
    html,
  });
};

/**
 * POST /api/auth/register
 * Register a new user (sends verification email)
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, country } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: 'Email, password, first name, and last name are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
      });
    }

    // Check if email already exists
    const existingUser = await req.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // If user exists but email not verified, allow re-sending verification
      if (!existingUser.emailVerified) {
        // Generate new verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await req.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
          },
        });

        // Send verification email
        await sendVerificationEmail(existingUser, verificationToken);

        return res.status(200).json({
          success: true,
          message: 'Verification email has been resent. Please check your inbox.',
          requiresVerification: true,
        });
      }

      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (not verified yet)
    const user = await req.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        country: country || null,
        role: 'STUDENT',
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(user, verificationToken);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find user with matching token
    const user = await req.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification token. Please request a new one.',
        expired: true,
      });
    }

    // Update user - mark as verified
    const updatedUser = await req.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        avatar: true,
        role: true,
      },
    });

    // Generate auth token so user is logged in
    const authToken = generateToken(updatedUser.id);

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to Tabsera Academy.',
      user: {
        ...updatedUser,
        first_name: updatedUser.firstName,
        last_name: updatedUser.lastName,
        role: updatedUser.role.toLowerCase(),
      },
      token: authToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/verify-email/:token
 * Verify email with token (GET for link clicks)
 */
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find user with matching token
    const user = await req.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      // Redirect to frontend with error
      return res.redirect(`${process.env.FRONTEND_URL}/verify-email?error=invalid`);
    }

    // Update user - mark as verified
    await req.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=true&email=${encodeURIComponent(user.email)}`);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await req.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a verification email shortly.',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: 'Email is already verified. You can log in to your account.',
        alreadyVerified: true,
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await req.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.json({
      success: true,
      message: 'Verification email has been sent. Please check your inbox.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await req.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
        email: user.email,
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Include edX info if user is registered
    const edxInfo = user.edxRegistered
      ? {
          edxUsername: user.edxUsername,
          edxRegistered: user.edxRegistered,
          hasEdxAccess: !!user.edxPassword,
        }
      : null;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        first_name: user.firstName,
        last_name: user.lastName,
        phone: user.phone,
        country: user.country,
        avatar: user.avatar,
        role: user.role.toLowerCase(),
        centerId: user.centerId,
        edxInfo,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await req.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link shortly.',
      });
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await req.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Hi ${user.firstName},</p>
          <p style="font-size: 16px; color: #374151;">We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link in your browser:</p>
          <p style="font-size: 14px; color: #2563eb; word-break: break-all;">${resetUrl}</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">This link will expire in 1 hour.</p>
          <p style="font-size: 14px; color: #6b7280;">If you didn't request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 14px; color: #6b7280;">Best regards,<br>Tabsera Academy Team</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Tabsera Academy',
      text: `Hi ${user.firstName},\n\nReset your password by clicking this link: ${resetUrl}\n\nThis link expires in 1 hour.\n\nBest regards,\nTabsera Academy Team`,
      html,
    });

    res.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link shortly.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
      });
    }

    // Find user with matching token
    const user = await req.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token. Please request a new one.',
        expired: true,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await req.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    user: {
      ...req.user,
      first_name: req.user.firstName,
      last_name: req.user.lastName,
      role: req.user.role.toLowerCase(),
    },
  });
});

/**
 * POST /api/auth/refresh
 * Refresh token (simplified - just return a new token)
 */
router.post('/refresh', authenticate, async (req, res) => {
  const token = generateToken(req.user.id);
  res.json({ success: true, token });
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { firstName, lastName, phone, country, avatar } = req.body;

    const user = await req.prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(country !== undefined && { country }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        avatar: true,
        role: true,
      },
    });

    res.json({
      success: true,
      user: {
        ...user,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/change-password
 * Change password
 */
router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long',
      });
    }

    // Get user with password
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await req.prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/edx-session
 * Get edX session for auto-login
 * Returns session info to automatically log user into edX
 */
router.get('/edx-session', authenticate, async (req, res, next) => {
  try {
    // Get full user info including edX credentials
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        edxUsername: true,
        edxPassword: true,
        edxRegistered: true,
      },
    });

    if (!user.edxRegistered || !user.edxPassword) {
      return res.status(400).json({
        success: false,
        message: 'User not registered on edX platform',
        edxRegistered: false,
      });
    }

    // Get the edX base URL for frontend
    const edxBaseUrl = process.env.EDX_BASE_URL || 'https://cambridge.tabsera.com';

    // Try to create an auto-login session
    const sessionResult = await edxService.generateAutoLoginUrl({
      email: user.email,
      encryptedPassword: user.edxPassword,
      returnUrl: `${edxBaseUrl}/dashboard`,
    });

    if (sessionResult.success) {
      res.json({
        success: true,
        edxBaseUrl,
        edxUsername: user.edxUsername,
        sessionId: sessionResult.sessionId,
        csrfToken: sessionResult.csrfToken,
        returnUrl: sessionResult.returnUrl,
      });
    } else {
      // If session creation failed, return basic info for manual login
      res.json({
        success: false,
        message: 'Could not create auto-login session',
        edxBaseUrl,
        edxUsername: user.edxUsername,
        loginUrl: `${edxBaseUrl}/login`,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/edx-login
 * Perform edX login and return session cookies
 * Used when auto-login is needed for course access
 */
router.post('/edx-login', authenticate, async (req, res, next) => {
  try {
    const { returnUrl } = req.body;

    // Get user's edX credentials
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        email: true,
        edxUsername: true,
        edxPassword: true,
        edxRegistered: true,
      },
    });

    if (!user.edxRegistered || !user.edxPassword) {
      return res.status(400).json({
        success: false,
        message: 'User not registered on edX platform',
      });
    }

    // Decrypt password and login
    const password = edxService.decryptPassword(user.edxPassword);
    const loginResult = await edxService.loginUser({
      email: user.email,
      password,
    });

    const edxBaseUrl = process.env.EDX_BASE_URL || 'https://cambridge.tabsera.com';

    if (loginResult.success) {
      res.json({
        success: true,
        edxBaseUrl,
        edxUsername: user.edxUsername,
        sessionId: loginResult.sessionId,
        csrfToken: loginResult.csrfToken,
        returnUrl: returnUrl || `${edxBaseUrl}/dashboard`,
      });
    } else {
      res.json({
        success: false,
        message: loginResult.error || 'edX login failed',
        edxBaseUrl,
        loginUrl: `${edxBaseUrl}/login`,
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
