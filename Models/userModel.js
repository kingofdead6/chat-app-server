const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{type: String, required: true , minlength: 3 , maxlenght: 30},
    email: {type: String, required: true, unique: true, minlength: 3 , maxlenght: 50},
    password: {type: String, required: true, minlength: 8 , maxlenght: 100} ,
    },
    {
        timestamps: true ,
    },
) ;

const UserModel = mongoose.model('User' , userSchema);

module.exports = UserModel;