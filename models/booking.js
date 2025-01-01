const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateFrom: {
        type: Date,
    },
    dateTo: {
        type: Date,
    },
    bookingFacilities: {
        type: String,
    }
});

const Bookings = mongoose.model('Bookings',bookingSchema)


module.exports=Bookings;