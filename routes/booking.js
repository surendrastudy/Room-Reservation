const express = require('express');
const router = express.Router();
const wrapAsync= require('../utils/wrapAsyc')
const {isLoggedIn}= require('../middleware.js');
const bookingController =require('../controllers/booking.js')

router.route('/:id/book')
.get(isLoggedIn,wrapAsync(bookingController.showBookingPage))
.put(isLoggedIn,wrapAsync(bookingController.addBookingData));

router.route('/payment/:id')
.get(isLoggedIn,wrapAsync(bookingController.renderPaymentPage))
.post(isLoggedIn,wrapAsync(bookingController.addPaymentInfo))

router.get('/watch',isLoggedIn,wrapAsync(bookingController.showWatchlist)); 
router.get('/watchlist/:id',isLoggedIn,wrapAsync(bookingController.addWatchlist));
router.get('/:id/drop',isLoggedIn,wrapAsync(bookingController.customerDeleteBooking));
router.delete('/watchlist/:id/unWatchlist',isLoggedIn,wrapAsync(bookingController.unWatchlist));
router.get('/cart',isLoggedIn,wrapAsync(bookingController.cart));
router.get('/userdetails/:id',isLoggedIn,wrapAsync(bookingController.userDetail));
router.get('/customerDetails/:id',isLoggedIn,wrapAsync(bookingController.customerDetails));
router.get('/:id/ownercancel',isLoggedIn,wrapAsync(bookingController.ownerDeleteBooking))
router.get('/billing/:id/owner',isLoggedIn,wrapAsync(bookingController.billing))
router.get('/backpage/:id',isLoggedIn,(bookingController.backPage))


module.exports = router;
