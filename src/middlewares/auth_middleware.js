const oturumAcilmis = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('error',['Lütfen Giriş Yapınız']);
        res.redirect('/login');
    }
}

const oturumAcilmamis = (req, res, next) => {
    if(!req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/yonetim');
    }
}



module.exports = {
    oturumAcilmis,
    oturumAcilmamis
}