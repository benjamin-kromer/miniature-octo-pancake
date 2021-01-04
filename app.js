//==========================================
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
//==========================================

const app = express();

//==========================================
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//==========================================
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
//==========================================

mongoose.connect('mongodb://localhost:27017/'+process.env.DB_NAME,{useNewUrlParser: true, useUnifiedTopology: true}); //?retryWrites=true&w=majority
//"mongodb+srv://"+process.env.DB_USERNAME+":"+process.env.DB_PASSWORD+process.env.DB_CLUSTER+"/"+process.env.DB_NAME
const userSchema = new mongoose.Schema({
    email: {
        type:String,
        required: true
    },
    password: {
        type:String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User',userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//==========================================
app.get('/',(req,res)=>{
    res.render('home',{})
});
app.get('/login',(req,res)=>{
    res.render('login',{})
});
app.get('/register',(req,res)=>{
    res.render('register',{})
});
app.post('/register',(req,res)=>{
    
    
});
app.post('/login',(req,res)=>{
    
    
    });
const listener = app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port "+listener.address().port);
  });