const express = require('express'); //from file npm install express 

//initialize the app
const app = express();

// port to be used
app.listen(3000, () => {
	console.log("App is running in port 3000");
})