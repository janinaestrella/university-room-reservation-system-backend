const router = require('express').Router();
const User = require ('./../models/User');
const bcrypt = require('bcrypt'); //npm install bcrypt

//register
router.post('/register', (req,res,next) => {
	//validation
	const {
		firstname,
		lastname,
		email,
		password,
		confirmPassword
	} = req.body;

	if(!firstname || !lastname || !email || !password || !confirmPassword){
		return res.status(400).send({
			error: "Incomplete fields"
		})
	}

	if(password.length < 8){
		return res.status(400).send({
			error: "Password should have atleast 8 characters"
		})
	}

	if(password !== confirmPassword){
		return res.status(400).send({
			error: "Password do not match"
		})
	}

	User.findOne({email})
	.then(user => {
		if(user) {
			return res.status(400).send({
				error: "Email already exists"
			})
		} else {
			const saltRounds = 5

			bcrypt.genSalt(saltRounds, function (err,salt){
				bcrypt.hash(password, salt, function (err, hash){
					//save hash password to database
					req.body.password = hash;

					User.create(req.body)
					.then(user => res.send(user))
					.catch(next);
				})
			})
		}
	})
})

//login
router.post('/login', (req,res,next) => {

})

//profile
router.get('/profile', (req,res,next) => {

})

module.exports = router;