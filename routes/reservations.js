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
	let reserveFrom = new Date (req.body.reserveFrom).getTime();
	let reserveUntil =  new Date (req.body.reserveUntil).getTime();
	
	// console.log(reserveFrom)
	// console.log(reserveUntil)


	if (reserveFrom >= reserveUntil){
		return res.status(400).send({
			error: "End time must be greater than Start time"
			})
	};

	//function for checking if reservation is already existing
	let reservationExists = (existingReserveFrom, existingReserveUntil, reserveFrom, reserveUntil) =>{
		if (reserveFrom > existingReserveFrom && reserveFrom < existingReserveUntil || 
      		existingReserveFrom >= reserveFrom && existingReserveFrom < reserveUntil) {
      
      		return res.status(400).send({
			error: "Reservation cannot be made"
			})
		}
	    return true
	}

	Room.findById(roomId)
	.then(room => {

		//get all reservations of chosen room using roomId
		Reservation.find({roomId: room._id})
		.then(reservations => {

			return reservations.map(reservation => {
				//get all existing reserveFrom and reserveUntil
				let existingReserveFrom = new Date(reservation.reserveFrom).getTime()
				let existingReserveUntil = new Date(reservation.reserveUntil).getTime()

					// console.log(existingReserveFrom)
					// console.log(existingReserveUntil)

				//call function reservationExists and pass boolean to result variable
				let result = reservationExists(existingReserveFrom,existingReserveUntil,reserveFrom,reserveUntil)

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
			reserveFrom: req.body.reserveFrom,
			reserveUntil: req.body.reserveUntil
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