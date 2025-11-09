const express=require("express");
const mongoose=require("mongoose");
const Listing=require("../models/listings.js");
const initData=require("./data.js");
main().then(()=>{
    console.log("database connected");
})
.catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/Airbnb');
}

const initDB = async()=>{
 await Listing.insertMany(initData.data);
 console.log("data is initialised");
}
initDB();
