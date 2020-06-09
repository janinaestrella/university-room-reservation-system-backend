const router = require('express').Router();
const Reservation = require ('./../models/Reservation');
const Room = require ('./../models/Room');
const passport = require('passport');
require('./../passport-setup');

//CREATE
router.post('/', passport.authenticate('jwt', {session:false}), (req,res,next) => {
	//userId
	let userId = req.user._id
	let reserverName = req.user.firstname + " " + req.user.lastname

	//roomId
	Room.findById(req.body.roomId)
	.then(room => {

		Reservation.create({
		userId: userId,
		reserverName: reserverName,
		roomId: req.body.roomId,
		roomName: room.name,
		price: room.price,
		reservedDateFrom: req.body.reservedDateFrom,
		reservedDateTo: req.body.reservedDateTo
		})
		.then(reservation => {
			res.send(reservation)
		})

	})

})

//GET ALL

//GET SPECIFIC

//UPDATE STATUS

module.exports = router;