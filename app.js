const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

//Template Engine Ayarları.
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
app.use(expressLayouts);
app.use(express.static('public'));
app.use("/uploads",express.static(path.join(__dirname,'/src/uploads')));
app.set('view engine', 'ejs');
app.set('views',path.resolve(__dirname,'./src/views'));

//DB BAĞLANTISI
require('./src/config/database.js');

const MongoDBStore = require('connect-mongodb-session')(session);

const sessionStore = new MongoDBStore({
    uri:process.env.MONGODB_CONNECTION_STRING,
    collection:'sessionlar'
})


//Session ve flash message

app.use(session(
    {secret : process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:1000 *60 *60 *24
    },
    store: sessionStore
}
));
app.use(flash());
app.use((req,res,next)=>{
    res.locals.validation_error = req.flash('validation_error');
    res.locals.success_message = req.flash('success_message');
    res.locals.email = req.flash('email');
    res.locals.ad = req.flash('ad');
    res.locals.soyad = req.flash('soyad');
    res.locals.sifre = req.flash('sifre');
    res.locals.resifre = req.flash('resifre');
    res.locals.login_error = req.flash('error');
    next();
});

app.use(passport.initialize());
app.use(passport.session());


//Routerlar include edilir
const authRouter = require('./src/routers/auth_router.js');
const yonetimRouter = require('./src/routers/yonetim_router.js');


//Formdan Gelen Değerlerin Okunabilmesi İçin
app.use(express.urlencoded({extended: true}));

let sayac = 0;



app.get('/',(req,res)=>{
    if(req.session.sayac){
        req.session.sayac++;
    }else{
        req.session.sayac = 1;
    }
    res.json({mesaj : 'Merhaba',sayacim:req.session.sayac});
});

app.use('/',authRouter);
app.use('/yonetim',yonetimRouter);

app.listen(process.env.PORT,()=>{
    console.log(`Server ${process.env.PORT} Portundan Ayaklandırıldı.`);
});