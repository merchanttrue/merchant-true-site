const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, fileUrl, message } = req.body;

  if (!name || !email || !fileUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Configure transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Email to Merchant True team
    await transporter.sendMail({
      from: `"Merchant True Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'contact@merchanttrue.com',
      subject: `New Statement Audit Request from ${name}`,
      text: `
        New Statement Audit Request:
        Name: ${name}
        Email: ${email}
        File URL: ${fileUrl}
        Message: ${message || 'No additional message'}
      `,
      html: `
        <h2>New Statement Audit Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>File URL:</strong> <a href="${fileUrl}">${fileUrl}</a></p>
        <p><strong>Message:</strong> ${message || 'No additional message'}</p>
      `,
    });

    // Confirmation email to the user
    await transporter.sendMail({
      from: `"Merchant True" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We've Received Your Statement - Merchant True`,
      text: `Hi ${name},\n\nThank you for choosing Merchant True. We've received your statement and our experts are already diving into the analysis. You can expect a detailed report within the next few hours.\n\nBest regards,\nThe Merchant True Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #006d3a;">We've Received Your Statement</h2>
          <p>Hi ${name},</p>
          <p>Thank you for choosing Merchant True. We've received your statement and our experts are already diving into the analysis.</p>
          <p>You can expect a detailed report within the next few business hours.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Merchant True | Independent Financial Advocacy</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
