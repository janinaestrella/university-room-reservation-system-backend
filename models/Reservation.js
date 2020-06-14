const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},

	reserverName: {
		type: String,
	},
	
	//Requested room
	roomId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Room'
	},

	roomName: {
		type: String
	},

	roomLocation: {
		type: String
	},

	reserveDate: {
		type: Number,
		required: [true, 'Reservation date is required']
	},

	reserveTimeStart: {
		type: Date,
		required: [true, 'Start time of reservation date is required']
	},

	reserveTimeEnd: {
		type: Date,
		required: [true, 'End time of reservation date is required']
	},

	price: {
		type: Number
	},

	description: {
		type: String,
	},
	
	image: {
		type: String,
	},

	//Reservation status
	isApproved: {
		type: Boolean,
		default: false
	}
	
})

const Reservation = mongoose.model('reservation', ReservationSchema);
module.exports = Reservation;
