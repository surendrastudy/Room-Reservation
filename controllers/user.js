const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

module.exports.renderSignupForm=(req,res)=>{
    res.render('users/signup.ejs')
}

module.exports.signup=async(req,res)=>{
    try{
    let{username,email,password}=req.body;
    const newUser =new User({email,username});
    const registeredUser = await User.register(newUser,password);
    // console.log(registeredUser)
    req.logIn(registeredUser,(err)=>{
        if(err){
           return next(err)
        };
        req.flash('success','Welcome to EasyStay')
        res.redirect('/listings');
    })
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/signup')
    }
}

module.exports.renderLoginForm=(req,res)=>{
    res.render('users/login.ejs')
};

module.exports.login=async(req,res)=>{
    req.flash('success','Welcome back to EasyStay! ')
    let redirectUrl = res.locals.redirectUrl || '/listings'   //new var
    console.log(redirectUrl)
    res.redirect(redirectUrl)  
}

module.exports.logout=(req,res)=>{
    req.logOut((err)=>{
        if(err){
            next(err)
        }
        req.flash('success','you are logged out !');
        res.redirect('/listings')
    })
}


module.exports.renderVerifyEmailPage=(req,res)=>{
    res.render('users/email.ejs')
}


let otps = {}; // In-memory storage for OTPs. 

const cleanupOtps = () => {
    const now = Date.now(); 
    for (const email in otps) {
        if (otps[email].expires <= now) { // Check if OTP has expired
            delete otps[email]; // Remove expired OTP
        }
    }
};

setInterval(cleanupOtps, 60 * 1000); // Check every minute


module.exports.verifyEmail= async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        req.flash('error', 'Email not found');
        return res.redirect('/verifyemail'); 
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    // Save the OTP in-memory with an expiration time (e.g., 10 minutes)
    otps[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };
    // console.log(otps)


    // Send the OTP to the user's email
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const mailOptions = {
        from: `EasyStay Room Reservation ${process.env.GMAIL_USER}`,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 10 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        req.flash('success', 'OTP sent to your email');
         res.locals.success = req.flash('success');
        return res.render('users/verifyOtp', { email });
    } catch (error) {
        console.error('Error sending OTP:', error);
        req.flash('error', 'Error sending OTP. Please try again.');
        return res.redirect('/verifyemail');
    }

};


module.exports.verifyOtp=(req, res) => {
    const { email, otp } = req.body;
    const storedOtp = otps[email];

    if (storedOtp && storedOtp.otp === otp && storedOtp.expires > Date.now()) {
        delete otps[email]; // OTP validated, remove it from storage
        req.flash('success', 'OTP verified. You can now change your password.');
        res.locals.success = req.flash('success');
        res.render('users/forgetpass.ejs');
    } else {
        req.flash('error', 'Invalid or expired OTP.');
        res.locals.error = req.flash('error');
        res.render('users/verifyOtp', { email })    
    }
}

module.exports.resetPassword= async (req, res) => {
    let { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) {
            req.flash('error', 'No user found with that username');
            res.locals.error = req.flash('error');
            res.render('users/forgetpass.ejs');
        }
        await user.setPassword(password);
        await user.save();
        req.flash('success', 'Password successfully updated');
        res.redirect('/login');
    } catch (e) {
        req.flash('error', e.message);
        res.render('users/forgetpass.ejs');
    }
}








