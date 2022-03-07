const mongoose = require('mongoose');
const schema = mongoose.Schema;

const UserSchema = new schema({
    ad:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:30
    },
    soyad:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:[30,"Soyadı Maksimum 30 Karakter Olabilir."]
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowecased:true,
    },
    emailAktif:{
        type:Boolean,
        default:false
    },
    sifre:{
        type:String,
        required:true,
        trim:true,
    },
    avatar:{
        type:String,
        default:"apple-icon-72x72.png"
    }
},{collection:'kullanicilar',timestamps:true});


const User = mongoose.model('User',UserSchema);



module.exports = User;