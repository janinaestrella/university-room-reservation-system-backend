const router = require('express').Router();
const multer = require('multer');  //npm install multer for uploading and saving images/files
const Room = require ('./../models/Room');
const passport = require('passport');
require('./../passport-setup');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

//middleware for checking authorization
const isAdmin = (req,res,next) => {
	if(req.user.isAdmin){
		return next();
	} else {
		return res.status(403).send("Forbidden")
	}
}

//cloud image uploader using multer-s3 
AWS.config.loadFromPath('./s3_config.json');
const s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: 'uniroomsbucket',
        key: function (req, file, cb) {
            console.log(file);
            cb(null,Date.now() + "-" + file.originalname )
        }
    })
});

//multer settings
//set the destination where the file will be saved
// const storage = multer.diskStorage({
// 	destination: function(req,file,cb){ 
// 		cb(null,'assets/images') //null - error message
// 	},

// 	filename: function(req,file,cb){
// 		//file will contain all information about the uploaded file
// 		console.log(file)
// 		cb(null,Date.now() + "-" + file.originalname )
// 	}
// })

// //middleware to access multer 
// const upload = multer({ storage }) 

//CREATE
router.post('/', passport.authenticate('jwt', {session:false}), upload.single('image'), isAdmin, (req, res, next) => {
	 // console.log(req.file);
	//validation
	const {
		name,
		price,
		location,
		description,
		image
	} = req.body;
	
	if(!name || !price || !location || !description){
		return res.status(400).send({
			error: "All fields are required"
		})
	}

	if(image == 'undefined'){
		return res.status(400).send({
			error: "All fields are required"
		})
	}

	// console.log(req.file.location)

	req.body.image = req.file.location
	Room.create(req.body)
	.then (room => res.send(room))
	.catch(next)
});

//GET ALL or INDEX
router.get('/', (req,res,next) => {
	Room.find().sort({name:1})
	.then (rooms => {
		return res.send(rooms)
	})
	.catch(next)
})

//GET SPECIFIC
router.get('/:id', (req,res,next) => {
	Room.findById(req.params.id)
	.then (room => {
		return res.send(room)
	})
	.catch(next)

})

//DELETE
router.delete('/:id', passport.authenticate('jwt', {session:false}), isAdmin, (req,res,next) => {
	Room.findByIdAndRemove(req.params.id)
	.then (room => {
		return res.send({
			room,
			message: "Successfully deleted"})
	})
	.catch(next)
})

//EDIT
router.put('/:id', passport.authenticate('jwt', {session:false}), upload.single('image'), isAdmin, (req,res,next) => {

	//update image if new image is existing, else do nothing
	if(req.file){
		req.body.image = req.file.location
	}

	Room.findByIdAndUpdate(
		req.params.id,
		req.body,
		{new: true}
		)
	.then (room => {
		return res.send(room)
	})
	.catch(next)
})

module.exports = router;