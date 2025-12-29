/**
 * Email Service using SendGrid
 */

const sgMail = require('@sendgrid/mail');

// Configure SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@tabsera.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Tabsera Academy';

/**
 * Verify connection (SendGrid doesn't require verification, but we log the status)
 */
const verifyConnection = async () => {
  if (SENDGRID_API_KEY && SENDGRID_API_KEY.startsWith('SG.')) {
    console.log('SendGrid API key configured');
    return true;
  }
  console.error('SendGrid API key not configured');
  return false;
};

/**
 * Send a single email
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      text,
      html,
    };

    const response = await sgMail.send(msg);
    console.log('Email sent to:', to);
    return { success: true, messageId: response[0]?.headers?.['x-message-id'] };
  } catch (error) {
    console.error('Email send error:', error.message);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

/**
 * Send bulk emails (with rate limiting)
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

  // edX Learning Platform Credentials
  edxCredentials: (user, { edxUsername, edxPassword, courses, edxBaseUrl }) => ({
    subject: 'Your Learning Platform Access - Tabsera Academy',
    text: `Hi ${user.firstName},\n\nYour learning platform account has been created!\n\nLogin URL: ${edxBaseUrl}/login\nUsername: ${edxUsername}\nPassword: ${edxPassword}\n\nYou have been enrolled in the following courses:\n${courses.map(c => `- ${c.title}`).join('\n')}\n\nPlease change your password after first login.\n\nBest regards,\nTabsera Academy Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Your Learning Platform Access</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Hi ${user.firstName},</p>
          <p style="font-size: 16px; color: #374151;">Your learning platform account has been created! Use the credentials below to access your courses.</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 15px 0; color: #111827;">Login Credentials</h3>
            <p style="margin: 8px 0; font-size: 14px;">
              <strong style="color: #6b7280;">Platform URL:</strong>
              <a href="${edxBaseUrl}/login" style="color: #2563eb;">${edxBaseUrl}/login</a>
            </p>
            <p style="margin: 8px 0; font-size: 14px;">
              <strong style="color: #6b7280;">Username:</strong>
              <span style="color: #111827; font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${edxUsername}</span>
            </p>
            <p style="margin: 8px 0; font-size: 14px;">
              <strong style="color: #6b7280;">Password:</strong>
              <span style="color: #111827; font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${edxPassword}</span>
            </p>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Important:</strong> Please change your password after your first login for security.
            </p>
          </div>

          ${courses.length > 0 ? `
          <div style="margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #111827;">Enrolled Courses</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              ${courses.map(c => `<li style="margin: 8px 0;">${c.title}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${edxBaseUrl}/login" style="background: #2563eb; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Login to Start Learning</a>
          </div>

          <p style="font-size: 14px; color: #6b7280;">If you have any questions, please contact our support team.</p>
          <p style="font-size: 14px; color: #6b7280;">Best regards,<br>Tabsera Academy Team</p>
        </div>
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; background: #f3f4f6;">
          <p>Tabsera Academy - Quality Education for Everyone</p>
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

  // Handle different template function signatures
  let emailContent;
  if (templateName === 'passwordReset') {
    emailContent = template(data.user || data, data.resetLink || data);
  } else if (templateName === 'orderConfirmation') {
    emailContent = template(data.order || data, data.user || data);
  } else if (templateName === 'enrollmentConfirmation') {
    emailContent = template(data.enrollment || data, data.user || data, data.course || data);
  } else if (templateName === 'edxCredentials') {
    emailContent = template(data.user || data, data);
  } else if (templateName === 'announcement') {
    emailContent = template(data.user || data, data);
  } else {
    emailContent = template(data);
  }

  const { subject, text, html } = emailContent;
  return sendEmail({ to, subject, text, html });
};

module.exports = {
  verifyConnection,
  sendEmail,
  sendBulkEmails,
  sendTemplatedEmail,
  templates,
};
