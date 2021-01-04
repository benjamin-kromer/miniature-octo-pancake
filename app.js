//==========================================
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
//==========================================

const app = express();

//==========================================
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
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

const User = new mongoose.model('User',userSchema);

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
    //console.log("req.body: ",req.body);
    bcrypt.hash(req.body.password,saltRounds,(err,hash)=>
    {
        if(!err){
            User.find({email: req.body.email},(err,foundUser)=>{
            if(!err){
                //console.log(foundUser);
                //console.log(foundUser.length);
                if(foundUser.length === 0){
                    const newUser = new User({
                        email: req.body.email,
                        password: hash
                    });
                    newUser.save();
                    console.log(`User registered!` );
                    res.render('login');
                }else{
                    //console.log(`User already exists ${foundUser}!`);
                    res.redirect('login');
                }
            }else{
                console.log(err);
                res.send(err);
            }
        })}else{
            console.log(err);
            res.send(err);
        }
    })
});
app.post('/login',(req,res)=>{
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;
   
    User.findOne({email:email},(err,foundUser)=>{
        if(!err){
             bcrypt.compare(req.body.password,foundUser.password,(err,result)=>{
                if(result === true){
                    res.render('secrets');
                }else{
                    res.redirect('register');
                }}) 
        }else{
            console.log("error",err);
            res.send(err);
            }}) 
        });

const listener = app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port "+listener.address().port);
  });
