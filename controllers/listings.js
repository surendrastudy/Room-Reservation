const Listing = require('../models/listing');

module.exports.index = async (req,res)=>{//Index Route
    const allListings = await Listing.find({});
     res.render("listings/index.ejs",{allListings})
 };

 module.exports.renderNewFrom=(req,res)=>{
     res.render('listings/new.ejs')
 };

module.exports.showListing=async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path:'reviews',populate:{path:'author'}})
   .populate('owner')
   .populate({path:'bookings',populate:{path:'user'}})
    
     //show in detail 
    if(!listing){
       req.flash('error','Property you requested for does not exits')
       res.redirect('/listings')
    }
    res.render('listings/show.ejs',{listing})
};

module.exports.createListing=async (req,res,next)=>{
  
    const newListing = new Listing( req.body.Listing);
    newListing.owner=req.user._id
    if (req.files && req.files.length > 0) {
        newListing.image = req.files.map(file => ({ url: file.path, filename: file.filename }));
    }

    await newListing.save()
    req.flash('success','New Property Created !')
    res.redirect('/listings')
    
};

module.exports.renderEditForm=async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    if(!listing){
        req.flash('error','Property you requested for does not exits')
        res.redirect('/listings')
     }

     let originalIamgeUrl = '';
     if (listing.image && listing.image.length > 0) {
        originalIamgeUrl = listing.image[0].url.replace('/upload', '/upload/w_250');
     }
     res.render('listings/edit.ejs', { listing, originalIamgeUrl });
     
};


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'Property not found');
        return res.redirect('/listings');
    }

    // Update listing with new data
    Object.assign(listing, req.body.Listing);

    // If new images are uploaded, replace old ones
    if (req.files && req.files.length > 0) {
        listing.image = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));
    }

    await listing.save();
    req.flash('success', 'Property Updated!');
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success',' Property Deleted !')
     res.redirect('/listings')

};


module.exports.searchListing=async (req, res) => {
    let { country } = req.body;
    // console.log(country)

    // Redirect to the results page with the search query as a query parameter
    res.redirect(`/listings/results?country=${encodeURIComponent(country)}`);
};

module.exports.searchResult=async(req,res)=>{
    let {country}= req.query;
    // console.log(country)
    const allListings = await Listing.find({
        "$or":[
            {"country":{$regex:country}},
            {"location":{$regex:country}},
        ]
    });
     res.render("listings/index.ejs",{allListings})
};

module.exports.specialOptions=async(req,res)=>{
    let {option} =req.params
    const allListings = await Listing.find({option:option})
    res.render("listings/index.ejs",{allListings})
}


module.exports.UserOption=async(req,res)=>{ //my Property
    let {user}= req.params
    const allListings = await Listing.find({owner:user});
     res.render("listings/index.ejs",{allListings})
}