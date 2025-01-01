const Listing = require('./models/listing')
const {listingSchmea,reviewSchema}= require('./schmea')
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review')

module.exports.isLoggedIn =(req,res,next)=>{
 

    if(!req.isAuthenticated()){ //check logged in ?
        req.session.redirectUrl = req.originalUrl
        req.flash('error','You must be logged in EasyStay !');
       return res.redirect('/login')
    }
    next();
}

module.exports.savRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl
        // console.log(res.locals.redirectUrl)
    };
    next()
};

module.exports.isOwner=async(req,res,next)=>{   //listing
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash('error',"You are not the owner of this Property")
        return res.redirect(`/listings/${id}`)
    }
    next();
}

module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchmea.validate(req.body)
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(',')
        throw new ExpressError(408,errMsg)  //console
    }else{
        next()
    }
};

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body)
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(',')
        throw new ExpressError(408,errMsg)  //console
    }else{
        next()
    }
};

module.exports.isReviewAuthor=async(req,res,next)=>{   //listing
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash('error',"You are not the Author of this Review")
        return res.redirect(`/listings/${id}`)
    }
    next();
}