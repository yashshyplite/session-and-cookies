const express = require("express")
const session = require("express-session")
const cookieParser = require('cookie-parser');
const bodyParser= require('body-parser');

// Setting up the server
var app = express();

app.use(bodyParser.urlencoded({extended:true}));
// Creating session
app.use(cookieParser());
app.use(session({
    name:'sid',
	key: "user_id",
	secret: "secret", // Secret key,
	saveUninitialized: false,
	resave: false,
	cookie:{
        maxAge: 1000*60*60*2
    }
}))

var redirectLogin = (req,res,next)=>{
    if(!req.session.userID){
        console.log('redirect to login')
        res.redirect('/login');
    }
    else{
        next();
    }
}

var redirecthome = (req,res,next)=>{
    if(req.session.userID){
        console.log('redirect to home')
        res.redirect('/');
    }
    else{
        next();
    }
}

app.route('/')
.get(redirectLogin,(req,res)=>{
    res.send("<form method='POST' action='/logout'><button type='submit'>logout</button></form>");
});

app.route('/login')
.get(redirecthome,(req,res)=>{
    res.sendFile(__dirname+'/index.html')
})
.post(redirecthome,(req,res)=>{
    var un=req.body.Id;
    var p = req.body.Password;
    console.log('logging in')
    try{
        if(un=='xxx'&&p=='xxx'){
            req.session.userID=un;
            return res.redirect('/');
        }
        res.redirect('/login')
    }
    catch(err){
        console.log(err);
    }
});
app.route('/logout')
.post((req,res)=>{
    req.session.destroy(err=>{
        console.log(err);
        if(err!=undefined)
        return res.redirect('/');
    })
    res.clearCookie('sid');
    return res.redirect('/');
});
app.listen(3000, () => {
	console.log("Server is Starting")
})
