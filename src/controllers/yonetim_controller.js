const User = require('../model/user_model');


const anaSayfayiGoster = function(req , res, next){
    res.render('index',{layout: './layout/yonetim_layout.ejs',title:'Yönetim Paneli Ana Sayfa'});
}
const profilSayfasiniGoster = function(req , res, next){

    res.render('profil',{user:req.user,layout: './layout/yonetim_layout.ejs',title:'Profil Sayfası'});
}

const profilSayfasiniGuncelle = async function(req , res, next){

    const guncelBilgiler = {
        ad:req.body.ad,
        soyad:req.body.soyad,
    }

    try{
        if(req.file ){
            guncelBilgiler.avatar = req.file.filename;
        }
        const sonuc =  await User.findByIdAndUpdate(req.user._id,guncelBilgiler);
        if(sonuc){
            console.log("Güncelleme Tamamlandı.");
            res.redirect('/yonetim/profil');
        }

    }catch(err){
        console.log(err);
    }

}



module.exports = {
    anaSayfayiGoster,
    profilSayfasiniGoster,
    profilSayfasiniGuncelle,
}