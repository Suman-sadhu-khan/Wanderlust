if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//routers
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//prerequisites

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//let's connect our mongodb server

const MONGODB_URL=process.env.MONGODB_URL;
const dbUrl=process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to db");
})
.catch((err) =>{
     console.log(err);
});

async function main() {
  await mongoose.connect(dbUrl);
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//mongostore configarations

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err)
})

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//session management
const sessionOption={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

app.use(session(sessionOption));

//using connect flash to display our massage

app.use(flash());

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//home page
app.get("/",(req,res)=>{
    res.render("listings/home.ejs");
});

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//passport configaration

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//res.local variables
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    // console.log(res.locals.success);
    next();
})

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//routers configaration
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//wildcard route error handling middleware
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"))
})

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//global error handling middleware

app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong!"}=err;
    res.status(statusCode).render("listings/error.ejs",{message});
    // res.status(statusCode).send(message);
})

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//port 8080
app.listen(8080,()=>{
    console.log("server is listening to port 8080");
})
