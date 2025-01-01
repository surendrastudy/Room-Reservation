const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync= require('../utils/wrapAsyc')
const Review = require('../models/review');
const {validateReview,isLoggedIn,isReviewAuthor}= require('../middleware')
const reviewController = require('../controllers/reviews')


//Review
//Post Route
router.post('/',isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
  
//Delete Review Route
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports=router;