import nodemailer from "nodemailer"
import express from "express";
import dotenv from "dotenv";

import { Logger } from "../utils/logger.js";

const logger = new Logger();

const router = express.Router();

dotenv.config();
let transporter;
try {
	if(process.env.NODE_ENV === "development"){
		let testAccount = await nodemailer.createTestAccount();
		transporter = nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass
			}
		});
	}
	else{
		transporter = nodemailer.createTransport({
			host: `${process.env.SMTP_HOST}`, //process.env.SMTP_HOST,
			port: process.env.SMTP_PORT, //process.env.SMTP_PORT,
			secure: true,
			auth: {
				user: `${process.env.SMTP_USER}`, //process.env.SMTP_USER,
				pass: `${process.env.SMTP_PASSWORD}` //process.env.SMTP_PASSWORD
			},
			tls: {
				rejectUnauthorized: false,
			}
		});
	}
	logger.log("INFO", "Transport ready");
} catch (error) {
	logger.log("ERROR", error);
}

async function sendEmailFirmOrder(name, email, note, file){
	try {
		let info = await transporter.sendMail({
			from: `${process.env.SMTP_USER}`,
			to: `${process.env.SMTP_USER}`,
			subject: "Заказ",
			text: `Номер телефона ---> ${name}\n Текст---> ${note} \n Почта ---> ${email}`,

			attachments: [
				{
					filename : file.name
				}
			]

		});
	}	catch (error) {
		logger.log("ERROR", error);
	}
	if(process.env.NODE_ENV === "development"){
		logger.log("DEBUG", "Preview URL: " + nodemailer.getTestMessageUrl(info));
	}
}

async function sendEmailClientOrder(email) {
	try {
		let info = await transporter.sendMail({
			from: `${process.env.SMTP_USER}`,
			to: `${email}`,
			subject: "Заказ на сайте мармакс",
			text: "Ваш заказ принят! \nС вами свяжутся в течении нескольких рабочих дней.",
		});
	}	catch (error) {
		logger.log("ERROR", error);
	}
	if(process.env.NODE_ENV === "development"){
		logger.log("DEBUG", "Preview URL: " + nodemailer.getTestMessageUrl(info));
	}
}

router.post("/sendorder", async (req, res) => {
    sendEmailFirmOrder(req.body.name, req.body.email, req.body.note, req.files.file);
    sendEmailClientOrder(req.body.email);
    return res.redirect("/")
});

export default router;