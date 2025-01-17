const passport = require('passport');
const User = require('./models/User');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

//check documentation: http://www.passportjs.org/packages/passport-jwt/

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

//use JWT strategy 
passport.use(new JwtStrategy(opts, function(jwt_payload, done) { 
	User.findById({ _id: jwt_payload._id}, function (err,user){ 
		if (err){ 
			return done (err, false)
		}

		if (user) { 
			return done (null, user) 
		} else {
			return done (null, false)
		}
	})
}))



