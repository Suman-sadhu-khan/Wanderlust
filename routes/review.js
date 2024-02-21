const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const{validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js")

const reviewController=require("../controllers/reviews.js")

//reviews
//post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//review edit route form
router.get("/:reviewId/edit",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.editReview));
 
// review edit update route
router.put("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.editUpdateReview))

 //delete review
 router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview))

 module.exports=router;