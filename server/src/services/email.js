/**
 * Email Service using AWS SES via SMTP
 */

const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify connection on startup
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error.message);
    return false;
  }
};

/**
 * Send a single email
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@tabsera.com',
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send bulk emails (with rate limiting for SES)
 */
const sendBulkEmails = async (emails, options = {}) => {
  const { delayMs = 100, batchSize = 50 } = options;
  const results = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (email, idx) => {
        // Add delay to avoid rate limiting
        if (idx > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        return sendEmail(email);
      })
    );

    results.push(...batchResults);

    // Pause between batches
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    total: emails.length,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
};

/**
 * Email templates
 */
const templates = {
  // Welcome email for new users
  welcome: (user) => ({
    subject: 'Welcome to Tabsera Academy!',
    text: `Hi ${user.firstName},\n\nWelcome to Tabsera Academy! We're excited to have you on board.\n\nStart exploring our courses today.\n\nBest regards,\nTabsera Academy Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Tabsera Academy!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Hi ${user.firstName},</p>
          <p style="font-size: 16px; color: #374151;">Welcome to Tabsera Academy! We're excited to have you on board.</p>
          <p style="font-size: 16px; color: #374151;">Start exploring our courses today and begin your learning journey.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/courses" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Browse Courses</a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Best regards,<br>Tabsera Academy Team</p>
        </div>
      </div>
    `,
  }),

  // Order confirmation
  orderConfirmation: (order, user) => ({
    subject: `Order Confirmed - ${order.referenceId}`,
    text: `Hi ${user.firstName},\n\nYour order ${order.referenceId} has been confirmed.\n\nTotal: $${order.total}\n\nThank you for your purchase!\n\nBest regards,\nTabsera Academy Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Hi ${user.firstName},</p>
          <p style="font-size: 16px; color: #374151;">Your order <strong>${order.referenceId}</strong> has been confirmed.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Order Total</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #111827;">$${order.total}</p>
          </div>
          <p style="font-size: 16px; color: #374151;">Thank you for your purchase! You can now access your enrolled courses.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/student/dashboard" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Best regards,<br>Tabsera Academy Team</p>
        </div>
      </div>
    `,
  }),

  // Password reset
  passwordReset: (user, resetLink) => ({
    subject: 'Reset Your Password - Tabsera Academy',
    text: `Hi ${user.firstName},\n\nYou requested to reset your password. Click the link below:\n\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nTabsera Academy Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Hi ${user.firstName},</p>
          <p style="font-size: 16px; color: #374151;">You requested to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">This link expires in 1 hour.</p>
          <p style="font-size: 14px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
          <p style="font-size: 14px; color: #6b7280;">Best regards,<br>Tabsera Academy Team</p>
        </div>
      </div>
    `,
  }),

  // Enrollment confirmation
  enrollmentConfirmation: (enrollment, user, course) => ({
    subject: `You're Enrolled in ${course.title}!`,
    text: `Hi ${user.firstName},\n\nYou're now enrolled in ${course.title}.\n\nStart learning today!\n\nBest regards,\nTabsera Academy Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">You're Enrolled!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Hi ${user.firstName},</p>
          <p style="font-size: 16px; color: #374151;">You're now enrolled in <strong>${course.title}</strong>.</p>
          <p style="font-size: 16px; color: #374151;">Start learning today and track your progress in your dashboard.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/student/courses" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Learning</a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Best regards,<br>Tabsera Academy Team</p>
        </div>
      </div>
    `,
  }),

  // Custom announcement/newsletter
  announcement: (user, { title, content, ctaText, ctaUrl }) => ({
    subject: title,
    text: `Hi ${user.firstName},\n\n${content}\n\n${ctaUrl ? `Learn more: ${ctaUrl}` : ''}\n\nBest regards,\nTabsera Academy Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">${title}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Hi ${user.firstName},</p>
          <div style="font-size: 16px; color: #374151;">${content}</div>
          ${ctaUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ctaUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">${ctaText || 'Learn More'}</a>
            </div>
          ` : ''}
          <p style="font-size: 14px; color: #6b7280;">Best regards,<br>Tabsera Academy Team</p>
        </div>
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>Tabsera Academy - Quality Education for Everyone</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Send templated email
 */
const sendTemplatedEmail = async (templateName, to, data) => {
  const template = templates[templateName];
  if (!template) {
    return { success: false, error: `Template "${templateName}" not found` };
  }

  const { subject, text, html } = template(data);
  return sendEmail({ to, subject, text, html });
};

module.exports = {
  transporter,
  verifyConnection,
  sendEmail,
  sendBulkEmails,
  sendTemplatedEmail,
  templates,
};
