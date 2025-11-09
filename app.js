const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema, reviewSchema}=require("./schema.js");
const listingsRouter = require('./routes/listings');
const reviewsRouter = require('./routes/reviews');
const authRouter = require('./routes/auth');

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// sessions & flash
const oneWeek = 1000 * 60 * 60 * 24 * 7;
app.use(session({
    name: 'sessionId',
    secret: 'a-very-secret-string',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: oneWeek
    }
}));
app.use(flash());

// Passport initialization and session support
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// expose flash to all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

// validation middleware
function validateListing(req, res, next){
    const { error } = listingSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

function validateReview(req, res, next){
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

app.get("/",(req,res)=>{
    res.send("Hi and Welcome");
});
// routes
app.use('/', authRouter);
app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewsRouter);
 app.use((req,res,next)=>{
     next(new ExpressError(404,"Page Not Found"));
 });

app.use((err,req,res,next)=>{
    // Treat invalid ObjectId errors as 404 Not Found for user-friendly messaging
    if (err.name === 'CastError') {
        err.statusCode = 404;
        err.message = 'Invalid listing ID or listing not found';
    }
    let { statusCode = 500, message = "Something Went Wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});
const port=5000;
app.listen(port,()=>{
console.log("app is running on the port "+port);
});

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/Airbnb');
}
main().then(()=>{
    console.log("database connected");
})
.catch((err)=>{
    console.log(err);
})



