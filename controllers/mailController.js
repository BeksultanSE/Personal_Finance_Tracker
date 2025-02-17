const nodemailer = require('nodemailer');
require('dotenv').config();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const API_URL = process.env.API_URL;

class Mail {
    constructor (){
        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: false,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD,
            }
        });
    }

    async sendActivationMail(to, link){
        try {
            await this.transporter.sendMail({
                from: SMTP_USER,
                to: to,
                subject: 'Account activation in ' + API_URL,
                text: '',
                html: `
                    <div>
                        <h1>Follow the link to activate your account</h1>
                        <a href='${link}'>${link}</a>
                    </div>
                `
            });
            console.log("Email sent to" + to);
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = new Mail();