const Listing=require("../models/listing.js");
const review = require("../models/review.js");
const Review=require("../models/review.js");

module.exports.createReview=async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    
    listing.reviews.push(newReview);
 
    await newReview.save();
    await listing.save();
    
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing._id}`)
};

module.exports.editReview=async(req,res)=>{
    let{id,reviewId}=req.params;
    const listing=await Listing.findById(id);
    const review=await Review.findById(reviewId);
    res.render("reviews/review_edit.ejs",{review,listing});
    // res.send("happy");
}

module.exports.editUpdateReview=async(req,res)=>{
    let{id,reviewId}=req.params;
    await Review.findByIdAndUpdate(reviewId,{...req.body.review});
    req.flash("success","Review Updated Successfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyReview=async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
}