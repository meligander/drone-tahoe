const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({
	path: path.resolve(__dirname, './config/.env'),
});

const apiRouter = require('./routes/api');

const app = express();

require('./config/db');

app.use(express.json({ limit: '50mb', extended: false }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cors());
app.use('/api', apiRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
