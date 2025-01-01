const Listing = require('../models/listing');
const Bookings = require('../models/booking');
const User = require('../models/user');

module.exports.showBookingPage=async(req,res)=>{
    let {id}=req.params
    const listing = await Listing.findById(id);
    res.render('booking/book.ejs',{listing})
}

module.exports.addBookingData= async (req, res) => {
    const { id } = req.params; 
    const listing = await Listing.findById(id);

    let newBookings = new  Bookings  (req.body.Bookings)
    newBookings.user = req.user._id
    
    listing.bookings.push(newBookings)

    await newBookings.save();
    await listing.save()
    
    req.flash('success',' Booking Done !')
    res.redirect(`/listings/${id}`);
};

module.exports.showWatchlist=async(req,res)=>{  

    const listings = await Listing.find({
        $or: [
            { bookings: { $exists: true } },
            { watchlist: { $exists: true } }
        ]
    }).populate({path:'bookings',populate:{path:'user'}})

    
    const allListings = listings.filter(listing => {
        return (
            (listing.bookings && listing.bookings.some(booking => booking.user &&booking.user._id.equals(res.locals.currUser._id))) ||
            (listing.watchlist && listing.watchlist.some(userId => userId &&userId.equals(res.locals.currUser._id)))
        );
    });
    // const allListings = listings.filter(listing => {
    //     const hasBooking = listing.bookings && listing.bookings.some(booking => booking.user && booking.user.equals(res.locals.currUser._id));
    //     const isInWatchlist = listing.watchlist && listing.watchlist.some(userId => userId && userId.equals(res.locals.currUser._id));
    //     return hasBooking || isInWatchlist;
    // });
    
    res.render("listings/index.ejs", { allListings });
    
}

module.exports.addWatchlist=async(req,res)=>{
    let { id } = req.params;
    let userId = req.user._id;
    await Listing.findByIdAndUpdate(id, { $addToSet: { watchlist: userId } });
    req.flash('success',' Watchlist Added  !')
    res.redirect(`/listings/${id}`);
}

module.exports.customerDeleteBooking= async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path:'bookings',populate:{path:'user'}})
    
    const index = listing.bookings.findIndex(booking => booking.user._id.equals(req.user._id));
    if (index !== -1) {

        const bookingId = listing.bookings[index]._id;
        listing.bookings.splice(index, 1);

        await listing.save(); 

        await Bookings.findByIdAndDelete(bookingId);

    }
    req.flash('success',' Booking Cancelled !')
    res.redirect('/booking/watch');
};

module.exports.unWatchlist=async(req,res)=>{
    let {id}= req.params;
    let userId = req.user._id;
    await Listing.findByIdAndUpdate(id, { $pull: { watchlist: userId } });
    req.flash('success',' Watchlist Deleted !')
    res.redirect(`/listings/${id}`);
};

module.exports.cart=async(req,res)=>{ 
    let allListings = await Listing.find({ owner: res.locals.currUser._id, bookings: { $exists: true, $ne: [] } });
    res.render("listings/index.ejs",{allListings})  
}

module.exports.userDetail= async (req, res) => {
    const { id } = req.params;  // Listing ID
    const userId = req.query.userId;  // User ID from query parameter

    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    // Find the specific listing by its ID and populate the bookings and their associated users
    let listing = await Listing.findById(id).populate({
        path: 'bookings',
        populate: { path: 'user' }
    });

    if (!listing) {
        return res.status(404).send('Listing not found');
    }

    // Filter bookings to only those associated with the given user
    listing.bookings = listing.bookings.filter(booking => booking.user._id.equals(userId));
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).send('User not found');
    }

    res.render('booking/bookingUser.ejs', { listings: [listing], user });
};

module.exports.customerDetails=async(req,res)=>{
    const { id } = req.params;
        const listing = await Listing.findById(id).populate({
            path: 'bookings',
            populate: { path: 'user' } 
        });
        if (!listing) {
            req.flash('error','Listing you requested for does not exits')
            res.redirect('/listings')
        }
        const listings = [listing];
     res.render('booking/customers.ejs',{listings})
}

module.exports.ownerDeleteBooking = async (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId;
    
    // Find the specific listing by its ID and populate the bookings and their associated users
    const listing = await Listing.findById(id)
        .populate({
            path: 'bookings',
            populate: { path: 'user' } 
        });

    if (!listing.owner.equals(req.user._id)) {
        req.flash('error', 'You are not authorized to perform this action');
        return res.redirect(`/listings/${id}`);
    }

    console.log("user delete", userId);

    // Find the booking index of the user you want to delete
    const bookingIndex = listing.bookings.findIndex(booking => booking.user._id.equals(userId));

    if (bookingIndex !== -1) {
        const bookingId = listing.bookings[bookingIndex]._id;
        // Remove the specific booking using the index
        listing.bookings.splice(bookingIndex, 1);
        // Delete the booking from the database
        await Bookings.findByIdAndDelete(bookingId);
        // Save the updated listing
        await listing.save();
    }

    req.flash('success', 'Booking completed successfully');
    res.redirect(`/booking/customerDetails/${id}`);
};



module.exports.billing=async(req,res)=>{
    const { id } = req.params;
    const userId = req.query.userId;
    
    // Find the specific listing by its ID and populate the bookings and their associated users
    const listing = await Listing.findById(id)
    .populate({
        path: 'bookings',
        populate: { path: 'user' } 
    }).populate('owner');;
    const user = await User.findById(userId)

    // Ensure that the user making the request is the owner of the listing
    if (!listing.owner.equals(req.user._id)) {
        req.flash('error', 'You are not authorized to perform this action');
        return res.redirect(`/listings/${id}`);
    }
      res.render('booking/billing.ejs',{user,listing})
}

module.exports.backPage=(req,res)=>{
    const { id } = req.params;
    res.redirect(`/listings/${id}`);
}

module.exports.renderPaymentPage=async(req,res)=>{

    let {id } = req.params
    let listing =  await Listing.findById(id)
    .populate({path:'bookings',populate:{path:'user'}})

    let currentBookingUserId= req.query.currentBookingUserId

    let totalprice = req.query.price
    // console.log(totalprice)

    let bookingId = await Bookings.findById(currentBookingUserId)
    .populate('user')

    res.render('booking/payment.ejs',{listing,bookingId,totalprice})
}

module.exports.addPaymentInfo = async(req,res)=>{
    let {id} = req.params
    // console.log(id)
    res.redirect(`/listings/${id}`);
}