const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    phone: {
        type: Number,
        minlength: 10,
        maxlength: 11
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    },
    matchingRequests: [{
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date
        },
        time: {
            hour: {
                type: Number
            },
            minute: {
                type: Number
            }
        },
        location: {
            type: String
        },
        accepted: {
            type: Boolean,
            default: false
        }
    }],

    matchedEvents: [{
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date
        },
        time: {
            type: String
        },
        location: {
            type: String
        }
    }]
})


userSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})

userSchema.methods.comparePassword = function (password, cb) {

    //비밀번호 1234567  암호화된 비밀번호 
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function (cb) {
    var user = this;
    //jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken');

    user.token = token;
    user.save().then((user) => {
        cb(null, user);
    }).catch((err) => {
        cb(err);
    })
}

userSchema.statics.findByToken = function (token, cb) {
    var user = this;

    //토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function (err, decoded) {
        //유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에 보관된 일치하는지 확인

        user.findOne({ "_id": decoded, "token": token })
            .then(user => {
                cb(null, user);
            }).catch((err) => {
                cb(err);
            })
    })
}
const User = mongoose.model('User', userSchema);

module.exports = { User };