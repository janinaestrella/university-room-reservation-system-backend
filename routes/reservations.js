const router = require('express').Router();
const Reservation = require ('./../models/Reservation');
const Room = require ('./../models/Room');
const passport = require('passport');
require('./../passport-setup');

//middleware for checking authorization
const isAdmin = (req,res,next) => {
	if(req.user.isAdmin){
		return next();
	} else {
		return res.status(403).send("Forbidden")
	}
}

//CREATE
router.post('/', passport.authenticate('jwt', {session:false}), (req,res,next) => {
	//userId
	let userId = req.user._id
	let reserverName = req.user.firstname + " " + req.user.lastname

	//roomId
	Room.findById(req.body.roomId)
	.then(room => {
		
		//reservation details
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
router.get('/', passport.authenticate('jwt', {session:false}), (req,res,next) => {
	//if admin is true, view all transactions
	if(req.user.isAdmin) {
		Reservation.find()
		.then(reservations => {
			res.send(reservations)
		})
		.catch(next)
	//if admin is false, view only his transactions
	} else {
		Reservation.find({userId:req.user._id})
		.then(reservations => {
			res.send(reservations)
		})
		.catch(next)
	}
})


//GET SPECIFIC BY ID
router.get('/:id', passport.authenticate('jwt', {session:false}), (req,res,next) => {
	//if admin is true, view all transactions
	if(req.user.isAdmin) {
		Reservation.find()
		.then(reservations => {
			res.send(reservations)
		})
		.catch(next)
	//if admin is false, view only his single transactions
	} else {
		Reservation.find({
			_id: req.params.id,
			userId:req.user._id
		})
		.then(reservation => {
			console.log(reservation.length)
			//display only users own transaction
			if(reservation.length !== 0){
				res.send(reservation) 

			//forbidden to view other users' reservations
			} else { 
				return res.status(403).send("Forbidden")
			}
		})
		.catch(next)
	}
})

//UPDATE STATUS

module.exports = router;