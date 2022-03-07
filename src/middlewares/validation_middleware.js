const {body} = require('express-validator');


const validateNewUser = ()=>{

    return [
        body('email').trim().isEmail().withMessage('Geçerli Bir Mail Giriniz.'),

        body('sifre').trim().isLength({min:6}).withMessage('Şifreniz 6 Karakterden Fazla Olmalıdır.')
        .isLength({max:20}).withMessage('Şifreniz 20 Karakterden Az Olmalıdır.'),

        body('ad').trim().isLength({min:3}).withMessage('Adınız 3 Karakterden Fazla Olmalıdır.')
        .isLength({max:20}).withMessage('Adınız 20 Karakterden Az Olmalıdır.'),

        body('soyad').trim().isLength({min:3}).withMessage('Soyadınız 3 Karakterden Fazla Olmalıdır.')
        .isLength({max:20}).withMessage('Soyadınız 20 Karakterden Az Olmalıdır.'),

        body('resifre').trim().custom((value,{req})=>{

            if(value !== req.body.sifre){
                throw new Error('Şifreler Uyuşmuyor.');

            }
            return true;
        })
    
    ];
}

const validateLogin = ()=>{

    return [
        body('email').trim().isEmail().withMessage('Geçerli Bir Mail Giriniz.'),

        body('sifre').trim().isLength({min:6}).withMessage('Şifreniz 6 Karakterden Fazla Olmalıdır.')
        .isLength({max:20}).withMessage('Şifreniz 20 Karakterden Az Olmalıdır.'),
    
    ];
}

const validateEmail = ()=>{
    return [
        body('email').trim().isEmail().withMessage('Geçerli Bir Mail Giriniz.'),
    ];
}


const validateNewPassword = ()=>{

    return [

        body('sifre').trim().isLength({min:6}).withMessage('Şifreniz 6 Karakterden Fazla Olmalıdır.')
        .isLength({max:20}).withMessage('Şifreniz 20 Karakterden Az Olmalıdır.'),
        
        body('resifre').trim().custom((value,{req})=>{

            if(value !== req.body.sifre){
                throw new Error('Şifreler Uyuşmuyor.');

            }
            return true;
        })
    
    ];
}
module.exports = {
    validateNewUser,
    validateLogin,
    validateEmail,
    validateNewPassword
}






