if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}
const { savRedirectUrl, isLoggedIn } = require('./middleware');
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Listing = require('./models/listing');       
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync= require('./utils/wrapAsyc')
const ExpressError = require('./utils/ExpressError');
const {listingSchmea,reviewSchema}= require('./schmea')
const listingRouter = require('./routes/listing')
const reviewRouter = require('./routes/review')
const userRouter = require('./routes/user')
const bookingRouter = require('./routes/booking')
const Bookings = require('./models/booking');


const session = require('express-session')
const MongoStore = require('connect-mongo');

const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

app.set('view engine',"ejs")
app.set('views',path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const dbUrl = process.env.ATLASDB_URL

const store = MongoStore.create({   //mongo session
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on('error',()=>{
    console.log('ERROR in MONGO SESSION STORE ',err)
});

const sessionOption ={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
}

app.use(session(sessionOption))
app.use(flash());


main().then(()=>console.log('sucessful connected'))
.catch((err)=>console.log(err));

async function main(){
    await mongoose.connect(dbUrl)
}

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));   //user & paswd
passport.serializeUser(User.serializeUser());   //store in session
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currUser=req.user;   //navbar page (login)
    next();
});

// /show/Boats
app.use('/listings',listingRouter);
app.use('/listings/:id/reviews',reviewRouter);
app.use('/booking',bookingRouter);
app.use('/',userRouter)


app.get('/',(req,res)=>{
    res.redirect('/listings')
})

app.all('*',(req,res,next)=>{
    next(new ExpressError(404,'Page Not Found '))
});

app.use((err, req, res, next) => {
    let {statusCode=404,message='something went wrong err'}=err;
    res.status(statusCode).render('error.ejs',{message})
});

app.listen(3000,()=>{
    console.log("listening 3000")
})
