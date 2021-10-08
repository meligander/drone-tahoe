var nodemailer = require('nodemailer');

require('dotenv').config();

const stamp = `<div style='text-align: center; width: fit-content; margin: 2rem 2rem 1rem'>
<h3 style='color: #15767c' >Drone Tahoe</h3>
<p>1635 N Bayshore Dr, Tahoe City, CA, 96145</p>
<p>+1 (305) 377-7369</p>
<a href="https://drone-tahoe.com/">www.drone-tahoe.com/</a>
</div>`;

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
		html: `<div>${text}</div>${stamp}`,
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
		html: `<div>${message}</div>${stamp}`,
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
