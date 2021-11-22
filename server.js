const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({
	path: path.resolve(__dirname, './config/.env'),
});

const apiRouter = require('./routes/api');

const app = express();

require('./config/db');

app.use(cors());
app.use(express.json({ limit: '50mb', extended: false }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use('/api', apiRouter);

if (process.env.NODE_ENV === 'production') {
	// Set static folder
	app.use(express.static('client/build'));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

const PORT =
	process.env.PORT || process.env.NODE_ENV === 'production' ? 3000 : 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
