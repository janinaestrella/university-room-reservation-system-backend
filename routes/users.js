const router = require('express').Router();
const User = require ('./../models/User');
const bcrypt = require('bcrypt'); //npm install bcrypt
const passport = require('passport'); //npm install passport 
const jwt = require('jsonwebtoken'); //npm install passport-jwt  jsonwebtoken
require('./../passport-setup');

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
	//validation
	const {
		email, 
		password} = req.body

	if(!email || !password) {
		return res.status(400).send({
			error: "Check credentials"
		})
	}
	
	User.findOne({email})
	.then(user => {
		if(!user){
			return res.status(400).send({
				error: "Check credential"
			})
		} else {
			bcrypt.compare(password, user.password, function (err,result){ 
				if(result) {

					return res.send({
						message: "Successful Login",
						user : {
							_id: user._id,
							firstname: user.firstname,
							lastname: user.lastname,
							email: user.email,
							password: user.password,
							confirmPassword: user.confirmPassword,
							isAdmin: user.isAdmin
						}
					})
				} else { 
					return res.status(400).send({
					error: "Check credentials"
					})
				}
				
			})
		}
	})
})

//profile
router.get('/profile', (req,res,next) => {
	res.send({
		_id: req.user._id,
		firstname: req.user.firstname,
		lastname: req.user.lastname,
		email: req.user.email,
		isAdmin: req.user.isAdmin,
	})

})

module.exports = router;