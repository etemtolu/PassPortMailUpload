const router = require('express').Router();
const authController = require('../controllers/auth_controller');
const validationMiddleware = require('../middlewares/validation_middleware');
const authMiddleware = require('../middlewares/auth_middleware');

router.get('/login',authMiddleware.oturumAcilmamis, authController.loginFormunuGoster);

router.post('/login',authMiddleware.oturumAcilmamis,validationMiddleware.validateLogin(),authController.login);

router.get('/register',authMiddleware.oturumAcilmamis,authController.registerFormunuGoster);

router.post('/register' ,authMiddleware.oturumAcilmamis,validationMiddleware.validateNewUser(), authController.register);

router.get('/forget-password',authMiddleware.oturumAcilmamis,authController.forgetPasswordFormunuGoster);

router.post('/forget-password',authMiddleware.oturumAcilmamis,validationMiddleware.validateEmail(),authController.forgetPassword);

router.get('/verify',authController.verifyMail);

router.get('/reset-password/:id/:token', authController.yeniSifreFormuGoster);

router.get('/reset-password', authController.yeniSifreFormuGoster);

router.post('/reset-password', validationMiddleware.validateNewPassword(), authController.yeniSifreyiKaydet);

router.get('/logout',authMiddleware.oturumAcilmis,authController.logout);



module.exports = router;