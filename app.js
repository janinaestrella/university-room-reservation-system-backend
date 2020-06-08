const express = require('express'); //from file npm install express 
const bodyParser = require('body-parser'); //npm install body-parser
const mongoose = require('mongoose'); //npm install mongoose

const rooms = require('./routes/rooms');
const reservations = require('./routes/reservations');
const users = require('./routes/users');

//initialize the app
const app = express();
const port = process.env.PORT || 5000

//connect to database
mongoose.connect('mongodb://localhost:27017/URRS', 
	{ 
		useNewUrlParser: true,
		useUnifiedTopology: true
	 }  
	);

app.use(bodyParser.json())

app.use('/', (req,res) => {
	res.send("welomce to backend")
})

//middlewares
app.use('/rooms', rooms);
app.use('/reservations', reservations);
app.use('/users', users);

// port to be used
app.listen(port, () => {
	console.log(`App is listening to port ${port}`);
})