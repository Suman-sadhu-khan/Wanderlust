const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// +++++++++++++++++++++++++++++++++++++++++++++++++++
//search by filters

module.exports.filterListing = async (req, res) => {
  let { filter } = req.params;
  
  let filteredListing = await Listing.find({ category: filter });
  if(filteredListing.length > 0){
     res.render("listings/index.ejs", { allListings:filteredListing });
  }else{
    req.flash("error","Your requested listing  does not exist!");
    res.redirect("/listings");
  }
};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++
//search by price

module.exports.filterPrice = async (req, res) => {
  let price = req.query.price;
  let filteredListing;
  price = Number(price);
  switch (price) {
    case 2000:
      filteredListing = await Listing.find({ price: { $lt: price + 1 } });
      break;
    case 3500:
      filteredListing = await Listing.find({
        price: { $gt: 2000, $lt: price + 1 },
      });
      break;
    case 5000:
      filteredListing = await Listing.find({
        price: { $gt: 3500, $lt: price + 1 },
      });
      break;
    case 7500:
      filteredListing = await Listing.find({
        price: { $gt: 5000, $lt: price + 1 },
      });
      break;
    case 10000:
      filteredListing = await Listing.find({
        price: { $gt: 7500, $lt: price + 1 },
      });
      break;
    case 10001:
      filteredListing = await Listing.find({ price: { $gt: price - 1 } });
  }
  if(filteredListing.length > 0){
    res.render("listings/index.ejs", { allListings:filteredListing });
  }else{
     req.flash("error","Your requested listing  does not exist!");
        res.redirect("/listings");
  }
};

// +++++++++++++++++++++++++++++++++++++++++++++++++
//search by title

module.exports.search=async(req,res)=>{
    // let value=req.body.search;
    let value=req.query.search;
    const allListings=await Listing.find(
        {title:{ $regex: value, $options: "i" }}
        );
    // res.send(value);
    // console.log(listing.country);
    if(allListings.length > 0){
        res.render("listings/search.ejs",{allListings});
    }
    else {
        req.flash("error","Your requested listing  does not exist!");
        res.redirect("/listings");
    }
    
}
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// (index logic)
module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// (new page form)
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// (listing show page)
module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error"," Your requested listing  does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});

};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// (create new listing)
module.exports.createListing=async(req,res,next)=>{

    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send()
     
   let url=req.file.path;
   let filename=req.file.filename;
   
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;
    let savedListing=await newListing.save();
    console.log(savedListing);

    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//(edit page for listing)

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error"," Your requested listing  does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//(uptade listing)
module.exports.updateListing=async (req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    let {id}=req.params;

   let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
if(typeof req.file !=="undefined"){
   let url=req.file.path;
   let filename=req.file.filename;
   listing.image={url,filename};
   await listing.save();
}
   req.flash("success","Listing Updated!");
   res.redirect(`/listings/${id}`);
};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//(delete listing route)
module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}