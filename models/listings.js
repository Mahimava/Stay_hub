const mongoose=require("mongoose");
const Review = require("./review");
const Schema=mongoose.Schema;
const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image:{
        filename: { type: String, default: 'listingimage' },
        url: { type: String, default: 'https://images.pexels.com/photos/2325447/pexels-photo-2325447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    },
    price:{
        type:Number,
        
    },
    location:{
        type:String,
    },
    country:{
        type:String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
})

listingSchema.post('findOneAndDelete', async function(doc){
    if(doc && doc.reviews && doc.reviews.length){
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;