const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");

const listingSchema=new Schema({
    title :{
        type:String,
        required:true,
    },
    description : String,
    image: {
        url:String,
        filename:String,
        // type:String,
        // default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        // set:(v)=>
        // v===""? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60":v,
        // // ternary operator..condition?true:false;
    },
    price:Number,
    location:String,
    country:String,
    category: {
        type: String,
        enum: [
        "Trending",
        "Iconic cities",
        "Mountains",
        "Artic",
        "Beach",
        "Rooms",
        "Lakes",
        "Boats",
        "Farms",
        "Ski-in/out",
        "Camping",
        ],
        required: true,
     },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
    }
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//(listing schema post middleware)
//(all reviews associated with any particular listing will get deleted , in case any listing got deleted!)

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing.reviews.length){
        await Review.deleteMany({_id:{$in: listing.reviews}});
    }
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const Listing=mongoose.model("Listing",listingSchema);

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports=Listing;