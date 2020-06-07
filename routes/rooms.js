const router = require('express').Router();
const multer = require('multer');  //npm install multer for uploading and saving images/files
const Room = require ('./../models/Room');

//multer settings
//set the destination where the file will be saved
const storage = multer.diskStorage({
	destination: function(req,file,cb){ 
		cb(null,'assets/images') //null - error message
	},

	filename: function(req,file,cb){
		//file will contain all information about the uploaded file
		// console.log(file)
		cb(null,Date.now() + "-" + file.originalname )
	}
})

//middleware to access multer 
const upload = multer({ storage }) 

//CREATE
router.post('/', upload.single('image'), (req, res, next) => {
	req.body.image = req.file.filename
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
router.get('/:id', (req,res,next) => {
	Room.findById(req.params.id)
	.then (room => {
		return res.send(room)
	})
	.catch(next)

})

//DELETE
router.delete('/:id', (req,res,next) => {
	Room.findByIdAndRemove(req.params.id)
	.then (room => {
		return res.send(room)
	})
	.catch(next)
})

//EDIT
router.put('/:id', upload.single('image'), (req,res,next) => {

	//update image if new image is existing, else do nothing
	if(req.file){
		req.body.image = req.file.filename
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