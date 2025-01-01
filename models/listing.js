const mongoose = require('mongoose');
const Review = require('./review');
const Bookings = require('./booking');


const listingSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    description:{
        type:String,
    },
    image:[

        {url:String,
        filename:String,}
    ],
    price:{
        type:Number,
    },
    location:{
        type:String,
    },
    country:{
        type:String,
    },

    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Review',
        }
    ],

    owner:{
        type:mongoose.Schema.Types.ObjectId,
            ref:'User',
    },
    
    option:{
        type:String
    },
 
    bookings: [
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Bookings"
        }
    ],

    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
});

listingSchema.post('findOneAndDelete',async(Listing)=>{
    if(Listing){
    await Review.deleteMany({_id:{$in:Listing.reviews}})
    }
});

listingSchema.post('findOneAndDelete',async(Listing)=>{
    if(Listing){
    await Bookings.deleteMany({_id:{$in:Listing.bookings}})
    }
});

//Add method to format dates


const Listing = mongoose.model("Room",listingSchema);

module.exports = Listing;