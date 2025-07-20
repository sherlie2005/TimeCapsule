const nodemailer = require('nodemailer');

// Configure the transporter using Gmail and credentials from environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a confirmation email when a time capsule is created.
 * @param {Object} capsule - The time capsule object containing email, title, message, deliveryDate
 */
const sendConfirmationEmail = async (capsule) => {
  try {
    if (!capsule.email) {
      console.error('❌ Capsule email is missing!');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: capsule.email,
      subject: `📦 Confirmation: Time Capsule "${capsule.title}" Created`,
      text: `Hello,\n\nYour time capsule "${capsule.title}" has been successfully created.\n\n` +
            `It will be delivered on: ${new Date(capsule.deliveryDate).toLocaleString()}.\n\n` +
            `Message:\n${capsule.message}\n\nThank you for using MemoirMail!`,
    };

    console.log('📨 Sending confirmation email to:', capsule.email);

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
  }
};

// Export the function as default
module.exports = sendConfirmationEmail;
