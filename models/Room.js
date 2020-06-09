const mongoose = require('mongoose'); //connect to mongoose
const Schema = mongoose.Schema;

//build table/schema
const RoomSchema = new Schema({
	name : {
		type: String, 
		required: [true, 'Room name is required'],
		max: [120, 'Maximum of 120 characters']
	},

	price: {
		type: Number,
		required: [true, 'Price is required']

	},

	location: {
		type: String,
		required: [true, 'Location of room is required']
	},

	description: {
		type: String,
		required: [true, 'Description is required']
	},
	
	image: {
		type: String,
		required: [true, 'Image is required']
	}

})

//create model 
const Room = mongoose.model('room', RoomSchema);
module.exports = Room;
