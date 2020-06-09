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

	reserveFrom: {
		type: Date
	},

	reserveUntil: {
		type: Date
	},

	price: {
		type: Number
	},

	// dateIn, dateOut
	// timeIn, timeOut

	//Reservation status
	isApproved: {
		type: Boolean,
		default: false
	}
	
})

const Reservation = mongoose.model('reservation', ReservationSchema);
module.exports = Reservation;
