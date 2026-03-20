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

export async function sendBookingNotification(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dealershipName: string;
  province: string;
  serviceInterest: string[];
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
  language: string;
}) {
  try {
    const interestList = data.serviceInterest.join(', ') || 'Not specified';
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@rvclaims.ca',
      to: 'hello@rvclaims.ca',
      subject: `New Discovery Call Booking — ${data.dealershipName} · ${data.scheduledDate} ${data.scheduledTime} ET`,
      html: `
        <h2>New Discovery Call Booking</h2>
        <p>A dealer has booked a discovery call:</p>
        <table cellpadding="6" style="border-collapse:collapse;font-size:14px;">
          <tr><td><strong>Name:</strong></td><td>${data.firstName} ${data.lastName}</td></tr>
          <tr><td><strong>Dealership:</strong></td><td>${data.dealershipName}</td></tr>
          <tr><td><strong>Province:</strong></td><td>${data.province}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${data.email}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${data.phone || '—'}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${data.scheduledDate}</td></tr>
          <tr><td><strong>Time:</strong></td><td>${data.scheduledTime} ET</td></tr>
          <tr><td><strong>Interests:</strong></td><td>${interestList}</td></tr>
          <tr><td><strong>Language:</strong></td><td>${data.language === 'fr' ? 'French' : 'English'}</td></tr>
          ${data.notes ? `<tr><td><strong>Notes:</strong></td><td>${data.notes}</td></tr>` : ''}
        </table>
        <hr>
        <p style="color:#666;font-size:12px;">Sent automatically from rvclaims.ca/book-demo</p>
      `,
      text: `
New Discovery Call Booking

Name: ${data.firstName} ${data.lastName}
Dealership: ${data.dealershipName}
Province: ${data.province}
Email: ${data.email}
Phone: ${data.phone || '—'}
Date: ${data.scheduledDate}
Time: ${data.scheduledTime} ET
Interests: ${interestList}
Language: ${data.language === 'fr' ? 'French' : 'English'}
${data.notes ? `Notes: ${data.notes}` : ''}
      `.trim(),
    };
    await transporter.sendMail(mailOptions);
    console.log('Booking notification email sent to hello@rvclaims.ca');
  } catch (error) {
    console.error('Failed to send booking notification email:', error);
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
