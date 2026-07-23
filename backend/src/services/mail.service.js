import nodemailer from "nodemailer";

/**
 * transporter  that is used to communicate the webserver to the SMTP server of gmail or any
 * other SMTP service
*/

const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
            type: "Oauth2",
            user: process.env.GOOGLE_USER,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            clientId: process.env.GOOGLE_CLIENT_ID
      }
});

transporter.verify()
      .then(() => { console.log("Email Transporter is ready to send emails") })
      .catch((err) => { console.error("Email Transporter verification is failed!", err.message) });

/**
 * function to send mail for account activation from SMTP server to client email address with
 * attached Account activation token
*/

export async function sendEmail({ to, subject, html, text }) {

      const mailOptions = {
            from: process.env.GOOGLE_USER,
            to,
            subject,
            html,
            text
      }

      const details = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully", details.messageId, details.response);
}

export default transporter;