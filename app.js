const express = require("express")
const session = require("express-session")
const cookieParser = require('cookie-parser');
const bodyParser= require('body-parser');
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");

var app = express();

Sentry.init({
    dsn: "https://e25d741c54c641f78f5cf6e17e8fb832@o1029468.ingest.sentry.io/5996959",
    release: "session@" + 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
    environment: "production",
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(Sentry.Handlers.errorHandler());
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
        // console.log('redirect to login')
        res.redirect('/login');
    }
    else{
        next();
    }
}

var redirecthome = (req,res,next)=>{
    if(req.session.userID){
        // console.log('redirect to home')
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
    Sentry.captureMessage("login");
    res.sendFile(__dirname+'/index.html')
})
.post(redirecthome,(req,res)=>{
    var un=req.body.Id;
    var p = req.body.Password;
    // console.log('logging in')
    try{
        if(un=='xxx'&&p=='xxx'){
            req.session.userID=un;
            return res.redirect('/');
        }
        else{
            Sentry.captureException("wrong password");
        }
        res.redirect('/login')
    }
    catch(err){
        Sentry.captureException(err);
    }
});


app.route('/logout')
.post((req,res)=>{
    req.session.destroy(err=>{
        // console.log(err);
        if(err!=undefined)
        return res.redirect('/');
    })
    res.clearCookie('sid');
    return res.redirect('/');
});
app.listen(3000, () => {
	console.log("Server is Starting")
})
