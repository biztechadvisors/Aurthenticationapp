require('dotenv').config();
const express=require("express");
// const bcrypt=require("bcrypt");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const passport=require("passport");
const session= require("express-session");
const passportlocalmongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require('mongoose-findorcreate');
const { response } = require('express');
// const Auth0Strategy= require("passport-auth0")

const app = express();

app.use(express.static("public"))   
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
    secret:"thisismysecret",
    resave:false,
    saveUninitialized:false,
}));



app.use(passport.initialize());
app.use(passport.session())


mongoose.connect("mongodb+srv://bizadmin:Techguru1234@biztech.rymsd3y.mongodb.net/Userdb",{useNewUrlParser:true})

const ayushSchema=new mongoose.Schema({
username:String,
email:String,
googleId: String,
password:String,
contact:Number,
secret:String
});
// mongoose.set('useCreateIndex',true)
// console.log(md5("12345"))


ayushSchema.plugin(passportlocalmongoose);
ayushSchema.plugin(findOrCreate)
 
const Ayush=new mongoose.model("Ayush",ayushSchema)

passport.use(Ayush.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Ayush.findById(id, function(err, user) {
    done(err, user);
  });
});
console.log(Ayush)


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile)
    Ayush.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


// const secret ="harrypotter";
// ayushSchema.plugin(encrypt, { secret: secret,encryptedFields:["password"] });

app.get("/",function(req,res){
    res.render("home")
})  
app.get("/auth/google",
    passport.authenticate('google', {scope: ["profile"]})
)

app.get("/auth/google/secret",
  passport.authenticate('google', {failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secret");
  });


app.get("/login",function(req,res){
    res.render("login")
})
app.get("/Registration",function(req,res){
    res.render("Registration")
})
app.get("/submit",function(req,res){
  if(req.isAuthenticated()){
          res.render("secret");
          console.log("isAuthenticated")
      }else{
          res.redirect("/login")
          console.log("isnotAuthenticated")
      }
  });

  app.get("/logout",function(req,res){
    res.redirect('/')
  })

  app.get("/secret",function(req,res){
    // Ayush.find({"secret":{$ne:null}},function(err,user){
    //   if(err){
    //     console.log(err);
    //   }else{
    //     if(user){
    //       res.redirect("/secret",{usersWithSecrets:user});
    //     }
    //   }
    // });
    res.render("secret")
  }); 

// app.post("/secret",function(req,res){
//   Ayush.find({"secret":{$ne:null}},function(err,user){
//     if(err){
//       console.log(err);
//     }else{
//       if(user){
//         res.render("secret",{usersWithSecrets:user});
//       }
//     }
//   });
// })

app.post('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.post("/submit", function(req, res){
  const submittedSecret = req.body.secret;
   Ayush.findById(req.user.id, function(err, user){
    if (err) {
      console.log(err);
    } else {
      if (user) {
        foundUser.secret = submittedSecret;
        foundUser.save(function(){
          res.redirect("/secret");
        });
      }
    }
  });
});
app.post("/Registration",async (req,res)=>{
    Ayush.register({username: req.body.fname,email:req.body.email,contact:req.body.contact}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        console.log("Reg Error")
        res.redirect("/Registration");
      } else {
        console.log("Reg Work")
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secret");
        });
      }
    });

app.post("/login",function(req,res){
  const User=new Ayush({
      username:req.body.username,
      password:req.body.password
  });
  console.log(User +" "+ res)
    req.login(User,function(err){
      if(err){
          console.log(err);
          console.log("error aa rhi login m")
      }else{
          console.log("login working"+ req)
          passport.authenticate('local', { failureRedirect: "login", failureMessage: true }),
          function(req, res) {
          // passport.authenticate("local")(req,res,function(){
              console.log("login working2"+User)
              return res.redirect("/secret")
          }
        }
      })
    })
  });
            // if (passport.model) {  

            //     console.log(" not working  "+User)    
            //     return res.redirect('/login?info=' + "youfial");    
            // }
                
            // else{
            //     return res.redirect("/secret")   
            // }
        
//     Ayush.register({username:req.body.fname},req.body.password,function(err,user){
//         if(err){
//             console.log("error aa rhi reg m")
//             console.log(err);
//             res.redirect("/Registration");
//         }else{
//             console.log("successfully register")
//             passport.authenticate()(req,res,function(){
//             res.redirect("/secret") 
//             })
//         }
//     })
// })

    app.listen(process.env.port||3000,'0.0.0.0',function(){
        console.log("server is running")
    })
