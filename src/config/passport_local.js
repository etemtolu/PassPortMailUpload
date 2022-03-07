const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/user_model');
const bcrypy = require('bcrypt');


module.exports = function(passport){
    const options={
        usernameField:'email',
        passwordField:'sifre',
    };
    passport.use(new LocalStrategy(options, async (email,sifre,done)=>{
        try{
         const _bulunanUser = await User.findOne({email:email});

         if(!_bulunanUser){
             return done(null,false,{message:'Bu email ile kayıtlı bir kullanıcı bulunamadı'});
         }
         const sifreKontrol = await bcrypy.compare(sifre,_bulunanUser.sifre);
        if(!sifreKontrol){
            return done(null,false,{message:'Şifre Hatalı'});
        }else{
            if(_bulunanUser && _bulunanUser.emailAktif === false){
                return done(null,false,{message:'Lütfen Emailinizi Onaylayın.'});
            }else
                    return done(null,_bulunanUser);
        }

        
        
        }catch(err){
            return done(err);
        }

    }));
    passport.serializeUser((user,done)=>{
        console.log('Sessiona Kaydedildi' + user.id);
        done(null,user.id);
    });

    passport.deserializeUser((id,done)=>{
        User.findById(id,(err,user)=>{
            const yeniUser = {
                id:user.id,
                email:user.email,
                ad:user.ad,
                soyad:user.soyad,
                sifre:user.sifre,
                olusturulmaTarihi:user.createdAt,
                avatar:user.avatar,
            }
            done(err,user);
        });
    });

}