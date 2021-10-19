var nodemailer = require('nodemailer');
const path = require('path');

require('dotenv').config();

const stamp = `<div style='text-align: center; width: fit-content; margin: 3rem 2rem 1rem'>
<img style='width: 100px;' src="cid:unique@nodemailer.com" alt="logo"/>
<p>1635 N Bayshore Dr, Tahoe City, CA, 96145</p>
<p>+1 (305) 377-7369</p>
<a href="${process.env.WEBPAGE_URI}">www.drone-tahoe.com</a>
</div>`;

const attachments = [
	{
		filename: 'logo.png',
		path: path.resolve(__dirname, '../media/logo.png'),
		cid: 'unique@nodemailer.com',
	},
];

const sendEmail = (user_email, subject, text) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.EMAIL_PASSWORD,
		},
		tls: { rejectUnauthorized: false },
	});

	const mailOptions = {
		from: `Drone Tahoe <${process.env.EMAIL}>`,
		to: user_email,
		subject,
		text,
		html: `<div style='font-size: 20px;'>${text}<br/>
		If you have any questions or concerns, please send an email to <a href="mailto:${process.env.EMAIL}">${process.env.EMAIL}</a>.<br/></div> ${stamp}`,
		attachments,
	};

	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error(error.message);
				reject('Something went wrong...');
			} else {
				console.log('Email sent: ' + info.response);
				resolve(true);
			}
		});
	});
};

const sendToCompany = (subject, message) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.EMAIL_PASSWORD,
		},
		tls: { rejectUnauthorized: false },
	});

	const mailOptions = {
		to: process.env.EMAIL,
		subject,
		message,
		html: `<div style='font-size: 20px'>${message}</div><br/>${stamp}`,
		attachments,
	};

	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error(error.message);
				reject('Something went wrong...');
			} else {
				console.log('Email sent: ' + info.response);
				resolve(true);
			}
		});
	});
};

module.exports = { sendEmail, sendToCompany };
