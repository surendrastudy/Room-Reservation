const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');
const dbUrl =`mongodb+srv://studymhtcet06:JdSNKgo02qa1lCRM@cluster0.qsblkg6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

main().then(()=>console.log('sucessful connected'))
.catch((err)=>console.log(err));



async function main(){
    await mongoose.connect(dbUrl)
}

const initDB = async ()=>{
   await Listing.deleteMany({});
   initData.data=initData.data.map((obj)=>({...obj,owner:'66530c5544c095edbe7960ec'})) //room owner add
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();