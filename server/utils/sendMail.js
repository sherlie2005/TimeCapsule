const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (to, subject, text) => {
  await transporter.sendMail({
    from: '"Time Capsule" <your@email.com>',
    to,
    subject,
    text
  });
};
