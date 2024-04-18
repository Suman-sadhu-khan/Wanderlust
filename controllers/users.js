const User=require("../models/user");

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//(signup form)
module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//(post signup route)
module.exports.signup=async(req,res)=>{
    try{
         let{username,email,password}=req.body;
         const newUser=new User({email,username});
         let registeredUser=await User.register(newUser,password);
         console.log(registeredUser);
         req.login(registeredUser,(err)=>{
             if(err){
                 return next(err);
             }
             req.flash("success","Welcome to Wanderlust!")
             res.redirect("/listings")
         });
    }catch(err){
     req.flash("error",err.message);
     res.redirect("/signup");
    }
 
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//(login form)
module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//(post login route)
module.exports.login=async(req,res)=>{
    req.flash("success","Welcome back to Wanderlust!");
    let redirectUrl=res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//(logout route)
module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out!")
        res.redirect("/listings")
    });
}