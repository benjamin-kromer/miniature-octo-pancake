//==========================================
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate')

//==========================================

const app = express();

//==========================================
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//==========================================
app.use(session({
    secret: process.env.COOKIE_SECRET,//process.env.COOKIE_SECRET
    resave: false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
//==========================================
//    CONNECT DATABASE
//==========================================
mongoose.connect('mongodb://localhost:27017/'+process.env.DB_NAME,{useNewUrlParser: true, useUnifiedTopology: true}); //?retryWrites=true&w=majority
//"mongodb+srv://"+process.env.DB_USERNAME+":"+process.env.DB_PASSWORD+process.env.DB_CLUSTER+"/"+process.env.DB_NAME
mongoose.set('useCreateIndex', true)
//==========================================
//      CREATE MONGOOSE SCHEMA
//==========================================
const userSchema = new mongoose.Schema({
    email:String,
    password: String,
    googleId: String
});
//==========================================
//          SCHEMA PLUGINS
//==========================================
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
//==========================================
//          MONGOOSE MODEL
//==========================================
const User = new mongoose.model('User',userSchema);
//==========================================

//==========================================
//     SOCIAL LOGIN OAUTH PASSPORT STUFF
//==========================================
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
//==========================================

//==========================================
//           ROUTES ROUTES ROUTES
//==========================================
app.get('/',(req,res)=>{
    res.render('home')
});
app.get('/login',(req,res)=>{
    res.render('login')
});
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);
app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/secrets");
  });
app.get('/register',(req,res)=>{
    res.render('register')
});
app.get('/secrets',function (req,res){
    if(req.isAuthenticated()){
        res.render('secrets');
    }else{
        res.redirect('/login');
    }
});
app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/');
});
app.get('/submit',function (req,res){
    if(req.isAuthenticated()){
        res.render('submit');
    }else{
        res.redirect('/login');
    }
});
app.post('/register',(req,res)=>{
    User.register({username: req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect('/register');
        }else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets');
            })
        }    
            })
    });
app.post('/login',(req,res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets")
            });
        }
       
    })
    });

//==========================================
//                  LISTENER
//==========================================
const listener = app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port "+listener.address().port);
  });
//==========================================