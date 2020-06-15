const router = require('express').Router();
const Reservation = require ('./../models/Reservation');
const Room = require ('./../models/Room');
const passport = require('passport');
require('./../passport-setup');
const moment = require('moment'); 
const stripe = require('stripe')('sk_test_51Gu7VXJzsbKmTz04k3TwOELhVy1upS72gk1h09HJAumzWsS6rGgmVMewqIIkT6CAc8n5DJWvXD2KDqwZnz0E291r00hgDRakg2');
const User = require('./../models/User')

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
	let roomLocation = req.body.roomLocation

	//get inputted time
	let reserveStart = new Date (req.body.reserveTimeStart).getTime();
	let reserveEnd =  new Date (req.body.reserveTimeEnd).getTime();
	
	// console.log(reserveStart) //8:20
	// console.log(reserveEnd) //9:20

	//convert date to number using moment
	let convertedDate = Number( moment(req.body.reserveDate).format('YYYYMMDD'))
	// console.log(convertedDate)
	
	if (reserveStart >= reserveEnd){
		return res.status(400).send({
			error: "End time must be greater than Start time."
			})
	};

	//function for checking if reservation is already existing
	let reservationExists = (existingReserveStart, existingReserveEnd, reserveStart, reserveEnd) =>{
		if (reserveStart >= existingReserveStart && reserveStart < existingReserveEnd || 
			//8:20 > 8:00 (true) && 8:20 < 9:00 (true) (TRUE) ||
      		existingReserveStart >= reserveStart && existingReserveStart < reserveEnd) {
      		//8:00 >= 8:20 (false) && 8:20 < 9:20 (true) (FALSE)
      		//TRUE || FALSE is TRUE so return error

      		return true
		}
	    return false
	}

	Room.findById(roomId)
	.then(room => {
		
		//get all reservations of chosen room using roomId
		Reservation.find({
			roomId: room._id,
			reserveDate: convertedDate
			// reserveDate: req.body.reserveDate
		})
		.then(reservations => {
			let reservationClash = false;
			reservations.map(reservation => {
				//get all existing reserveStart and reserveEnd
				let existingReserveStart = new Date(reservation.reserveTimeStart).getTime()
				let existingReserveEnd = new Date(reservation.reserveTimeEnd).getTime()

					// console.log(existingReserveStart) // 8:00
					// console.log(existingReserveEnd) // 9:00

				//call function reservationExists and pass boolean to result variable
				reservationClash = reservationExists(existingReserveStart,existingReserveEnd,reserveStart,reserveEnd)

				//boolean result
				// console.log("pasok after checking " + reservationClash)
				return reservationClash
			})

			// console.log ("reservation before condition:" + reservationClash)
			if (!reservationClash){
				// console.log("save reservation")
				// create reservation
				Reservation.create({
					userId: userId,
					reserverName: reserverName,
					roomId: req.body.roomId,
					roomName: room.name,
					roomLocation: room.location,
					price: room.price,
					description: room.description,
					image: room.image,
					reserveDate: convertedDate,
					reserveTimeStart: req.body.reserveTimeStart,
					reserveTimeEnd: req.body.reserveTimeEnd
				})
				.then(reservation => {
					res.send(reservation)
				})
				.catch(next)

			} else {
				// console.log("cannot save")
				return res.status(400).send({
				error: "Reservation cannot be made. Choose a different timeslot."
				})
				
			}
			
		})

	})
	

})

//GET ALL
router.get('/', passport.authenticate('jwt', {session:false}), (req,res,next) => {
	//if admin is true, view all transactions
	if(req.user.isAdmin) {
		Reservation.find().sort({reserveDate: 1, reserveTimeStart: 1})
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
		Reservation.findById(req.params.id)
		.then(reservations => {
			res.send(reservations)
		})
		.catch(next)
	//if admin is false, view only his single transactions
	} else {
		Reservation.find({
			_id: req.params.id,
			userId: req.user._id
		})
		.then(reservation => {
			//if reservation is empty,forbidden to view other users' reservations
			if(reservation.length === 0){
				return res.status(403).send("Forbidden")

			} else { 
			//display only users own transaction
				res.send(reservation) 
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

// //DELETE
// router.delete('/:id', passport.authenticate('jwt', {session:false}), (req,res,next) =>{
// 	//admin and users can only delete their OWN reservations
// 	Reservation.findOneAndRemove({
// 		_id: req.params.id,
// 		userId:req.user._id
// 	})
// 	.then(reservation => {
// 		//display only user/admin own transaction
// 		if(reservation){
// 			res.send(reservation) 

// 		//forbidden to delete other users' reservations
// 		} else { 
// 			return res.status(403).send("Forbidden")
// 		}
// 	})
// 	.catch(next)

// })

//STRIPE
router.post('/stripe', (req,res,next) => {
	let price = req.body.price;

	User.findOne({ _id: req.body.customerId })
        .then(user => {
            if (!user) {
                res.status(500).send({ message: "Incomplete" })
            } else {
                if (!user.stripeCustomerId) {
                    // create customer to stripe
                    stripe.customers.create({ email: user.email })
                        .then(customer => {
                            return User.findByIdAndUpdate({ _id: user._id }, { stripeCustomerId: customer.id }, { new: true })
                        })
                        .then(user => {
                            return stripe.customers.retrieve(user.stripeCustomerId)
                        })
                        .then(customer => {
                            return stripe.customers.createSource(customer.id, {
                                source: 'tok_visa'
                            })
                        })
                        .then(source => {
                            return stripe.charges.create({
                                amount: price * 100,
                                currency: 'usd',
                                customer: source.customer
                            })
                        })
                        .then(charge => {
                            // new charge create d on a new customer

                            res.send(charge)
                        })
                        .catch(err => {
                            res.send(err)
                        })
                } else {
                    stripe.charges.create({
                        amount: price * 100,
                        currency: 'usd',
                        customer: user.stripeCustomerId
                    })
                        .then(charge => {
                            res.send(charge)
                        })
                        .catch(err => {
                            res.send(err)
                        })
                }
            }
        })

})

module.exports = router;