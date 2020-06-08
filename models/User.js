const mongoose = require ('mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
	firstname:{
		type: String,
		required: [true, 'First name is required']
	},

	lastname : {
		type: String,
		required: [true, 'Last Name is required']
	},

	email: {
		type: String,
		required: [true, 'Email is required']
	},

	password : {
		type: String,
		required: [true, 'Password is required']
	},

	confirmPassword : {
		type: String,
		required: [true, 'Confirm Password is required']
	},

	isAdmin: {
		type: Boolean,
		default: false
	}

	
})

const User = mongoose.model('user', UserSchema);
module.exports = User;
