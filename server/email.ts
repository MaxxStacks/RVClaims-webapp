import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWaitlistNotification(data: {
  email: string;
  dealershipName: string;
}) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@rvclaims.ca',
      to: 'hello@rvclaims.ca',
      subject: 'New Network Marketplace Waitlist Signup',
      html: `
        <h2>New Waitlist Registration</h2>
        <p>A new dealer has joined the Network Marketplace waitlist:</p>
        <ul>
          <li><strong>Dealership Name:</strong> ${data.dealershipName}</li>
          <li><strong>Email:</strong> ${data.email}</li>
        </ul>
        <p>This notification was sent automatically from the RV Claims Canada website.</p>
      `,
      text: `
New Waitlist Registration

A new dealer has joined the Network Marketplace waitlist:

Dealership Name: ${data.dealershipName}
Email: ${data.email}

This notification was sent automatically from the RV Claims Canada website.
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log('Waitlist notification email sent to hello@rvclaims.ca');
  } catch (error) {
    console.error('Failed to send waitlist notification email:', error);
  }
}

export async function sendContactFormNotification(data: {
  dealershipName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  language: string;
}) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@rvclaims.ca',
      to: 'hello@rvclaims.ca',
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p>You have received a new message from the RV Claims Canada website:</p>
        <ul>
          <li><strong>Dealership Name:</strong> ${data.dealershipName}</li>
          <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Phone:</strong> ${data.phone}</li>
          <li><strong>Language:</strong> ${data.language === 'en' ? 'English' : 'French'}</li>
        </ul>
        <h3>Message:</h3>
        <p>${data.message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This notification was sent automatically from the RV Claims Canada website.</p>
      `,
      text: `
New Contact Form Submission

You have received a new message from the RV Claims Canada website:

Dealership Name: ${data.dealershipName}
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
Language: ${data.language === 'en' ? 'English' : 'French'}

Message:
${data.message}

This notification was sent automatically from the RV Claims Canada website.
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log('Contact form notification email sent to hello@rvclaims.ca');
  } catch (error) {
    console.error('Failed to send contact form notification email:', error);
  }
}
