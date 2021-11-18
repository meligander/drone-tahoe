const nodemailer = require('nodemailer');
const path = require('path');

require('dotenv').config();

const stamp = `<h5 style="color: #002855; margin-top: 20px; font-size: 18px">Drone Tahoe</h5>
<div style='margin: 30px 20x 10px; font-size: 15px;text-align: center; width: fit-content;'>
<img style='width: 100px;' src="cid:unique@nodemailer.com" alt="logo"/>
<p>55 W Lake Blvd #1, Tahoe City, CA 96145</p>
<p>+1 (530) 412-2255</p>
<a href="${process.env.WEBPAGE_URI}">${process.env.WEBPAGE_URI}</a>
</div>`;

const attachments = [
	{
		filename: 'logo.png',
		path: path.resolve(__dirname, '../media/logo.png'),
		cid: 'unique@nodemailer.com',
	},
];

const sendEmail = async (user_email, subject, text) => {
	const emailTransporter = await createTransporter();

	const mailOptions = {
		from: `Drone Tahoe <${process.env.EMAIL}>`,
		to: user_email,
		subject,
		text,
		html: `<div style='font-size: 20px;'>${text}
		<br/><br/>
		If you have any questions, please send an email to 
		<a href="mailto:${process.env.EMAIL}">${process.env.EMAIL}</a>.<br/></div> ${stamp}`,
		attachments,
	};

	return new Promise((resolve, reject) => {
		emailTransporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error(error.message);
				reject({ message: 'Something went wrong...' });
			} else {
				console.log('Email sent: ' + info.response);
				resolve(true);
			}
		});
	});
};

const sendToCompany = async (subject, message) => {
	const emailTransporter = await createTransporter();

	const mailOptions = {
		to: process.env.EMAIL,
		subject,
		message,
		html: `<div style='font-size: 20px'>${message}</div><br/>${stamp}`,
		attachments,
	};

	return new Promise((resolve, reject) => {
		emailTransporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error(error.message);
				reject({ message: 'Something went wrong...' });
			} else {
				console.log('Email sent: ' + info.response);
				resolve(true);
			}
		});
	});
};

const sendOutreachEmail = async (subject, message, users) => {
	const emailTransporter = await createTransporter();

	const mailOptions = {
		from: `Drone Tahoe <${process.env.EMAIL}>`,
		to: users,
		subject,
		message,
		html: `<div style='font-size: 20px'>${message}
		<br/><br/>
		If you have any questions, please send an email to 
		<a href="mailto:${process.env.EMAIL}">${process.env.EMAIL}</a>.<br/></div>${stamp}`,
		attachments,
	};

	return new Promise((resolve, reject) => {
		emailTransporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error(error.message);
				reject({ message: 'Something went wrong...' });
			} else {
				console.log('Email sent: ' + info.response);
				resolve(true);
			}
		});
	});
};

const createTransporter = async () => {
	const transporter = nodemailer.createTransport({
		host: 'smtp.office365.com',
		port: 587,
		secureConnection: 'false',
		tls: {
			ciphers: 'SSLv3',
			rejectUnauthorized: false,
		},
		auth: {
			user: process.env.EMAIL,
			pass: process.env.EMAIL_PASSWORD,
		},
		tls: { rejectUnauthorized: false },
	});

	return transporter;
};

module.exports = { sendEmail, sendToCompany, sendOutreachEmail };
