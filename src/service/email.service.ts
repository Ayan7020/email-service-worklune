import path from "path";
import ejs from "ejs";
import nodeMailer from "nodemailer";

interface SendEmailPayload {
    name: string;
    otp: string;
    email: string;
    subject?: string;
}

export const sendMailViaSmtp = async (payload: SendEmailPayload) => {
    try {
        const templatePath = path.resolve(__dirname, "../utils/email.ejs");

        const htmlContent = await ejs.renderFile(templatePath, {
            name: payload.name,
            otp: payload.otp,
        });

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILEUSERNAME,
                pass: process.env.MAILPASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.MAILEUSERNAME || "no-reply@WorkLune.com",
            to: payload.email,
            subject: payload.subject ?? "Your WorkLune Email Verification Code",
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[SMTP] Email sent to ${payload.email}`);
        return true;

    } catch (error: any) {
        console.error("[SMTP] Error sending email:", error?.message);
        return false;
    }
} 