const express = require('express');
const router = express.Router();
const wrapAsync= require('../utils/wrapAsyc')
const {isLoggedIn,isOwner,validateListing}= require('../middleware.js');
const listingController =require('../controllers/listings.js')
const multer  = require('multer')
const {storage}=require('../cloudConfig.js');
const upload = multer({ storage }) //save in folder


//Search Route
router.post('/search',wrapAsync(listingController.searchListing))
router.get('/results',wrapAsync(listingController.searchResult))

//option Route
router.get('/special/:option',wrapAsync(listingController.specialOptions))

//Index,Create Route
router.route('/')
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.array('Listing[image]',10),wrapAsync(listingController.createListing));


//New Route     2
router.get('/new',isLoggedIn,listingController.renderNewFrom); 

//show1 ,Update,Delete Route     
router.route('/:id')
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.array('Listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))
 
//Edit Route
router.get('/:id/edit',isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));
router.get('/:user/UserListing',isLoggedIn,wrapAsync(listingController.UserOption))
module.exports = router;