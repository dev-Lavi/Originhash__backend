import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL, // Your Gmail or service email
      pass: process.env.EMAIL_PASS, // App password (not your actual password)
    },
  });

  const mailOptions = {
    from: `"OriginHash" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
