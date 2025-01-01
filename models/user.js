const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
    },
});     //username and passwd created by plugin

userSchema.plugin(passportLocalMongoose); //username , passwd ,hasing ,salt

module.exports = mongoose.model('User', userSchema);
