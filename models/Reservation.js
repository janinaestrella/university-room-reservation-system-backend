const mongoose = require ('mongoose');
const Schema = mongoose.Schema;


const ReservationSchema = new Schema({
	studentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},

	studentName: {
		type: String
	},
	
	//Requested rooms
	rooms: [{}],

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
