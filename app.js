const express = require('express'); //from file npm install express 
const bodyParser = require('body-parser'); //npm install body-parser
const mongoose = require('mongoose'); //npm install mongoose
const cors = require('cors'); //npm install cors
require('dotenv').config(); //npm install dotenv

const rooms = require('./routes/rooms');
const reservations = require('./routes/reservations');
const users = require('./routes/users');

//initialize the app
const app = express();
const port = process.env.PORT || 5000

//connect to database
mongoose.connect(process.env.ATLAS, 
	{ 
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify : true,
	 }  
	);

app.use(bodyParser.json())
app.use(cors());

//middlewares
app.use('/rooms', rooms);
app.use('/reservations', reservations);
app.use('/users', users);
app.use('/public', express.static('assets/images'))
app.use('/reservations', reservations);

// error handling middleware
app.use((err,req,res,next)=> {
	res.status(400).send({
		error: err.message
	})
})

// port to be used
app.listen(port, () => {
	console.log(`App is listening to port ${port}`);
})