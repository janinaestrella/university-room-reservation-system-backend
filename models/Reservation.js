const mongoose = require ('mongoose');
const Schema = mongoose.Schema;


const ReservationSchema = new Schema({
	name:{
		type: String
	}
	
})

const Reservation = mongoose.model('reservation', ReservationSchema);
module.exports = Reservation;
