const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsyc = require('../utils/wrapAsyc');
const passport = require('passport');
const { savRedirectUrl, isLoggedIn } = require('../middleware');
const userController=require('../controllers/user');

router.route('/signup')
.get(userController.renderSignupForm)
.post(wrapAsyc(userController.signup));

router.route('/verifyemail')
.get(userController.renderVerifyEmailPage)
.post(wrapAsyc(userController.verifyEmail))


router.route('/login')//eska under hee username and passwd hai in build
.get(userController.renderLoginForm)
.post(savRedirectUrl,
    passport.authenticate('local',{
    failureRedirect: '/login',failureFlash:true 
    }),
    userController.login );

router.get('/logout',userController.logout)


router.post('/verifyotp',userController.verifyOtp );

router.patch('/reset-password',userController.resetPassword);


module.exports=router;