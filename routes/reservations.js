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

	let userId = req.user._id
	let reserverName = req.user.firstname + " " + req.user.lastname
	let roomId = req.body.roomId

	//get inputted time
	let reserveStart = new Date (req.body.reserveTimeStart).getTime();
	let reserveEnd =  new Date (req.body.reserveTimeEnd).getTime();
	
	// console.log(reserveStart) //8:20
	// console.log(reserveEnd) //9:20


	if (reserveStart >= reserveEnd){
		return res.status(400).send({
			error: "End time must be greater than Start time."
			})
	};

	//function for checking if reservation is already existing
	let reservationExists = (existingReserveStart, existingReserveEnd, reserveStart, reserveEnd) =>{
		if (reserveStart > existingReserveStart && reserveStart < existingReserveEnd || 
			//8:20 > 8:00 (true) && 8:20 < 9:00 (true) (TRUE) ||
      		existingReserveStart >= reserveStart && existingReserveStart < reserveEnd) {
      		//8:00 >= 8:20 (false) && 8:20 < 9:20 (true) (FALSE)
      		//TRUE || FALSE is TRUE so return error

      		return res.status(400).send({
			error: "Reservation cannot be made. Choose a different timeslot."
			})
		}
	    return true
	}

	Room.findById(roomId)
	.then(room => {

		//get all reservations of chosen room using roomId
		Reservation.find({
			roomId: room._id,
			reserveDate: req.body.reserveDate
		})
		.then(reservations => {

			return reservations.map(reservation => {
				//get all existing reserveStart and reserveEnd
				let existingReserveStart = new Date(reservation.reserveTimeStart).getTime()
				let existingReserveEnd = new Date(reservation.reserveTimeEnd).getTime()

					// console.log(existingReserveStart) // 8:00
					// console.log(existingReserveEnd) // 9:00

				//call function reservationExists and pass boolean to result variable
				let result = reservationExists(existingReserveStart,existingReserveEnd,reserveStart,reserveEnd)

				//boolean result
				return result
			})
		})

		// reservation details
		Reservation.create({
			userId: userId,
			reserverName: reserverName,
			roomId: req.body.roomId,
			roomName: room.name,
			price: room.price,
			reserveDate: req.body.reserveDate,
			reserveTimeStart: req.body.reserveTimeStart,
			reserveTimeEnd: req.body.reserveTimeEnd
		})
		.then(reservation => {
			res.send(reservation)
		})
		.catch(next)

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
router.put('/:id', passport.authenticate('jwt', {session:false}), (req,res,next) => {

	//if admin is true, allow to update reservation status
	if (req.user.isAdmin){
		Reservation.findByIdAndUpdate(
			req.params.id,
			{ isApproved: req.body.isApproved }, 
			{ new: true } 
		)
		.then(reservation => {
			return res.send(reservation)
		})
		.catch(next)
	
	//if admin is false, user is forbidde to update reservation status
	} else {
		return res.status(403).send("Forbidden")
	}
})

module.exports = router;