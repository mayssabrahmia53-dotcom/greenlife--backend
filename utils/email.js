// utils/email.js
const nodemailer = require("nodemailer");

// Pour le développement, on simule l'envoi sans vraie configuration email
// Tu pourras passer à un vrai service (Gmail, SendGrid, etc.) plus tard.

async function sendEmail(to, subject, text) {
  // ⚠️ MODE DÉV : on affiche juste le code dans la console
  console.log("========== EMAIL SIMULÉ ==========");
  console.log(`À : ${to}`);
  console.log(`Sujet : ${subject}`);
  console.log(`Message : ${text}`);
  console.log("==================================");
  
  // Tu peux commenter les lignes au-dessus et décommenter plus bas
  // quand tu auras configuré un vrai compte email.

  /* // Version réelle avec Nodemailer (plus tard)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: `"GreenLife" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });
  */
}

module.exports = { sendEmail };