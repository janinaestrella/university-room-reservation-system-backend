const express = require('express'); //from file npm install express 
const bodyParser = require('body-parser'); //npm install body-parser
const mongoose = require('mongoose'); //npm install mongoose

const rooms = require('./routes/rooms');

//initialize the app
const app = express();

//connect to database
mongoose.connect('mongodb://localhost:27017/URRS', 
	{ 
		useNewUrlParser: true,
		useUnifiedTopology: true
	 }  
	);

app.use(bodyParser.json())

//middlewares
app.use('/rooms', rooms);

// port to be used
app.listen(3000, () => {
	console.log("App is running in port 3000");
})