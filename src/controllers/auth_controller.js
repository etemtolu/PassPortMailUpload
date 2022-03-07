const {validationResult} = require('express-validator');
const User = require('../model/user_model');
const passport = require('passport');
require('../config/passport_local')(passport);
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt =require('jsonwebtoken');




const loginFormunuGoster = (req,res,next) => {
    res.render('login',{layout: './layout/auth_layout.ejs',title:'Giriş Yap'});
};
const login = (req,res,next) => {
    const hatalar = validationResult(req);
    req.flash('email',req.body.email);
        req.flash('sifre',req.body.sifre);

    if(!hatalar.isEmpty()) {
        req.flash('validation_error',hatalar.array());
        
        res.redirect('/login');
    }else{
        passport.authenticate('local',{
            successRedirect:'/yonetim',
            failureRedirect:'/login',
            failureFlash:true
        })(req,res,next);
    }

};

const registerFormunuGoster = (req,res,next) => {
    res.render('register',{layout: './layout/auth_layout.ejs',title:'Kayıt Ol'});
};
const register = async(req,res,next) => {
    const hatalar = validationResult(req);
    if(!hatalar.isEmpty()) {
        req.flash('validation_error',hatalar.array());
        req.flash('email',req.body.email);
        req.flash('ad',req.body.ad);
        req.flash('soyad',req.body.soyad);
        req.flash('sifre',req.body.sifre);
        req.flash('resifre',req.body.resifre);
        res.redirect('/register');
    }else{

        try{
            const _user = await User.findOne({email:req.body.email});
            if(_user && _user.emailAktif == true){
                req.flash('validation_error',[{msg:'Bu email adresi zaten kullanılıyor.'}]);
                req.flash('ad',req.body.ad);
                req.flash('soyad',req.body.soyad);
                req.flash('sifre',req.body.sifre);
                req.flash('resifre',req.body.resifre);
                res.redirect('/register');
            }else if((_user && _user.emailAktif == false) || _user == null){
                if(_user){
                    await User.findOneAndRemove({_id:_user._id});
                }
                const newUser = new User({
                    email:req.body.email,
                    ad:req.body.ad,
                    soyad:req.body.soyad,
                    sifre:await bcrypt.hash(req.body.sifre,10),

                });
                await newUser.save();
                console.log("Kullanıcı Kaydedildi");
                


                //jwt İşlemleri

                const jwtBilgileri = {
                    id:newUser._id,
                    mail:newUser.email,
                };

                const jwtToken = jwt.sign(jwtBilgileri,process.env.CONFIRM_MAIL_JWT_SECRET,{expiresIn:'1d'});
                console.log(jwtToken);


                //Mail Gönderme İşlemleri
                const url = process.env.WEB_SITE_URL+'verify?id='+jwtToken;

                let transporter = nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user:process.env.GMAIL_USER,
                        pass:process.env.GMAIL_SIFRE
                    }
                });
                await transporter.sendMail({
                    from:'NodeJS Uygulaması <info@nodejskursu.com',
                    to:newUser.email,
                    subject:'Email Doğrulama Haciiiiiiii',
                    text:'Email Doğrulama Linki : ' + url,

                },(error,info)=>{
                    if(error){
                        console.log("Bir Hata Oluştu " + error);
                    }else{
                        console.log('Email Gönderildi.');
                        console.log(info);
                        transporter.close();
                    }
                });
                req.flash('success_message',[{msg:'Lütfen Mail Kutunuzu Kontrol Edin.'}]);
                res.redirect('/login');
            }
        }catch(e){
            console.log(e);
        }
    }
};
const forgetPasswordFormunuGoster = (req,res,next) => {
    res.render('forget_password',{layout: './layout/auth_layout.ejs',title :'Şifremi Unuttum'});
};
const forgetPassword = async(req,res,next) => {
    const hatalar = validationResult(req);
    if(!hatalar.isEmpty()) {
        req.flash('validation_error',hatalar.array());
        req.flash('email',req.body.email);
       
        res.redirect('/forget-password');
    }
    //Burası Çalışıyorsa Kullanıcı Düzgün Bir Mail Girmiştir.

    else{
        try{
            const _user = await User.findOne({email:req.body.email,emailAktif:true});
            if(_user){
                //Kullanıcıya Şifre Sıfırlama Maili Atılabilir.
                const jwtBilgileri = {
                    id:_user._id,
                    mail:_user.email,
                };
                const secret = process.env.RESET_PASSWORD_JWT_SECRET+"-"+_user.sifre;
                const jwtToken = jwt.sign(jwtBilgileri,secret,{expiresIn:'1d'});
                
                //Mail Gönderme İşlemleri
                const url = process.env.WEB_SITE_URL+'reset-password/'+_user._id+'/'+jwtToken;

                let transporter = nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user:process.env.GMAIL_USER,
                        pass:process.env.GMAIL_SIFRE
                    }
                });
                await transporter.sendMail({
                    from:'NodeJS Uygulaması <info@nodejskursu.com',
                    to:_user.email,
                    subject:'Şifre Sıfırlama',
                    text:'Şifrenizi Oluşturma Linki : ' + url,

                },(error,info)=>{
                    if(error){
                        console.log("Bir Hata Oluştu " + error);
                    }else{
                        console.log('Email Gönderildi.');
                        console.log(info);
                        transporter.close();
                    }
                });
                req.flash('success_message',[{msg:'Lütfen Mail Kutunuzu Kontrol Edin.'}]);
                res.redirect('/login');

            }else{
                req.flash('validation_error',[{msg:'Bu email adresi kayırlı değil veya Kullanıcı Pasif.'}]);
                req.flash('email',req.body.email);
                res.redirect('forget-password');
            }               
                console.log(jwtToken);


                
            
        }catch(e){
            console.log(e);
        }    
    }
    res.render('forget_password',{layout: './layout/auth_layout.ejs'});
};
const logout=(req,res,next) => {
    req.logout();
    req.session.destroy((error)=>{
        res.clearCookie('connect.sid');
        //req.flash('success_message',[{msg:'Başarıyla Çıkış Yaptınız.'}]);
        res.render('login',{layout: './layout/auth_layout.ejs',title:'Giriş Yap',success_message:[{msg:'Başarıyla Çıkış Yaptınız.'}]});
        //res.send('Çıkış Yapıldı.')
    });
    
};

const verifyMail = (req, res, next) => {
    const token = req.query.id;
    if(token){
        
            try{
                jwt.verify(token,process.env.CONFIRM_MAIL_JWT_SECRET,async (e,decoded)=>{
                if(e){
                    req.flash('error','Kod Hatalı veya Süresi Geçmiş.');
                    res.redirect('/login');
                }else{
                    const tokenIcindekiIDDegeri = decoded.id;
                    const sonuc = await User.findByIdAndUpdate(tokenIcindekiIDDegeri,{emailAktif:true});
                    if(sonuc){
                        req.flash('success_message',[{msg:'Email Doğrulama Başarılı.'}]);
                        res.redirect('/login');
                    }else{
                        req.flash('error_message','Lütfen Tekrar Kullanıcı Oluşturun. ');
                        req.redirect('/login');
                    }
                }
            });
        }catch(err){
            
            }
            

    }else { 
        req.flash('error_message','Token Yok Veya Geçersiz. ');
        req.redirect('/login');
    }
};

const yeniSifreyiKaydet = async (req,res,next) => {
    const hatalar = validationResult(req);

    if(!hatalar.isEmpty()) {
        req.flash('validation_error',hatalar.array());
        req.flash('sifre',req.body.sifre);
        req.flash('resifre',req.body.resifre);
       
        res.redirect('/reset-password/'+req.body.id+'/'+req.body.token);
    }else{
        const _bulunanUser = await User.findOne({ _id: req.body.id, emailAktif:true });
    
            const secret = process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;
    
            try {
                jwt.verify(req.body.token, secret, async (e, decoded) => {
                
                    if (e) {
                        req.flash('error', 'Kod Hatalı veya Süresi Geçmiş');
                        res.redirect('/forget-password');
                    } else {
                        //yeni Şifre Kayıt İşlemleri
                        const hashedPassword = await bcrypt.hash(req.body.sifre,10);
                        const sonuc = await User.findByIdAndUpdate(req.body.id,{sifre:hashedPassword});
                    if(sonuc){
                        req.flash('success_message',[{msg:'Şifre Başarıyla Güncellendi.'}]);
                        res.redirect('/login');
                    }else{
                        req.flash('error_message','Lütfen Şifre Sıfırlama Adımlarını Yapın.');
                        req.redirect('/login');
                    }
    
                    }
                });
            } catch (err) {
                console.log('Hata Çıktı '+ err);
          }


        
  }
}




    const yeniSifreFormuGoster = async (req, res, next) => {
        const linktekiID = req.params.id;
        const linktekiToken = req.params.token;
    
        if (linktekiID && linktekiToken) {
    
            const _bulunanUser = await User.findOne({ _id: linktekiID });
    
            const secret = process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;
    
            try {
                jwt.verify(linktekiToken, secret, async (e, decoded) => {
                
                    if (e) {
                        req.flash('error', 'Kod Hatalı veya Süresi Geçmiş');
                        res.redirect('/forget-password');
                    } else {
                        console.log(decoded);
    
                        res.render('new_password', {id:linktekiID, token:linktekiToken, layout: './layout/auth_layout.ejs', title:'Şifre Güncelle' });
    
                    }
                });
            } catch (err) {
                
          }
          
          
        } else {
            req.flash('validation_error', [{msg : "Lütfen maildeki linki tıklayın. Token Bulunamadı"}]);
                   
                    res.redirect('forget-password');
        }
    }
    
module.exports = {
    loginFormunuGoster,
    registerFormunuGoster,
    forgetPasswordFormunuGoster,
    register,
    login,
    forgetPassword,
    logout,
    verifyMail,
    yeniSifreFormuGoster,
    yeniSifreyiKaydet
}