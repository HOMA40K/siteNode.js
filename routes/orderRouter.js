import nodemailer from "nodemailer"
import express from "express";
import dotenv from "dotenv";


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
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: true,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASSWORD
			},
			tls: {
				rejectUnauthorized: false,
			}
		});
	}
	console.log("INFO", "Transport ready");
} catch (error) {
	console.log("ERROR", error);
}


async function sendEmailFirmFeedback(name, email, note,file){
    let info = await transporter.sendMail({
		from: "\"МАРМАКС\" <snab@marmakc.com>",
		to: "snab@marmakc.com",
		subject: "Отзыв",
		text: `Номер телефона ---> ${name}\n Текст---> ${note} \n Почта ---> ${email}`,

        attachments: [
            {
                filename : file.file.name
            }
        ]

	});
}
async function sendEmailFirmOrder(name, email, note, file){

    let info = await transporter.sendMail({
		from: "\"МАРМАКС\" <snab@marmakc.com>",
		to: "snab@marmakc.com",
		subject: "Заказ",
		text: `Номер телефона ---> ${name}\n Текст---> ${note} \n Почта ---> ${email}`,

        attachments: [
            {
                filename : file.name
            }
        ]

	});

	if(process.env.NODE_ENV === "development"){
		console.log("DEBUG", "Preview URL: " + nodemailer.getTestMessageUrl(info));
	}
}
async function sendEmailClientOrder(email) {
	let info = await transporter.sendMail({
		from: "\"МАРМАКС\" <snab@marmakc.com>",
		to: email,
		subject: "Заказ на мармакс",
		text: "Ваш заказ принят! \nС вами свяжутся в течении нескольких рабочих дней.",


	});

	if(process.env.NODE_ENV === "development"){
		console.log("DEBUG", "Preview URL: " + nodemailer.getTestMessageUrl(info));
	}
}
export async function sendEmailClientFeedback(email) {

	let info = await transporter.sendMail({
		from: "\"МАРМАКС\" <snab@marmakc.com>",
		to: email,
		subject: "Отзыв",
		text: "Спасибо, что выбрали нас!"

	});

	if(process.env.NODE_ENV === "development"){
		console.log("DEBUG", "Preview URL: " + nodemailer.getTestMessageUrl(info));
	}
}

router.post("/feedback", async (req, res) => {
	sendEmailFirmFeedback(req.body.name, req.body.email, req.body.note, req.files);
	sendEmailClientOrder(req.body.email);
	return res.redirect("/")
});

router.post("/sendorder", async (req, res) => {
    sendEmailFirmOrder(req.body.name, req.body.email, req.body.note, req.files.file);
    sendEmailClientOrder(req.body.email)
    return res.redirect("/")
});

export default router;