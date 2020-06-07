const router = require('express').Router();
const Room = require ('./../models/Room');

//CREATE
router.post('/', (req, res, next) => {
	Room.create(req.body)
	.then (room => res.send(room))
	.catch(next)
});

//GET ALL or INDEX
router.get('/', (req,res,next) => {
	Room.find()
	.then (rooms => {
		return res.send(rooms)
	})
	.catch(next)
})

//GET SPECIFIC
//DELETE
//EDIT


module.exports = router;