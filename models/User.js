const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        validate: {
            validator: item => {
                return item.length >= 6
            },
            message: "Tên đăng nhập phải dài hơn 6 kí tự"
        }
    },
    password: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        validate: {
            validator: item => {
                return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(item)
            },
            message: "Email không hợp lệ"
        }
    },
    role: {
        type: String,
        require: true,
        default: "USER",
    },
    name: {
        type: String,
        require: true,
        default: "",
        trim: true,
        validate: {
            validator: value => value.length <= 50,
            message: "Tên hiển thị phải ngắn hơn 50 ký tự"
        }
    },
    avatar: {
        type: String,
        require: true,
        default: ''
    },
    status: {
        type: String,
        require: true,
        default: 'active'
    },
    birthday: {
        type: Date,
        required: true,
        default: ''
    },

    gender: {
        type: String,
    },
    stogare: {
        type: Number,
        require: true,
        default: 20*1024
    },
    currentUsage: {
        type: Number,
        require: true,
        default: 0
    },
},
    {
        timestamps: true,
    }
);

schema.index({ fullname: 'text', email: 'text' });

schema.pre('deleteOne', { query: true, document: false }, async function (next) {
    // 'this' is the client being removed. Provide callbacks here if you want
    // to be notified of the calls' result.
    let id = this.getQuery()['_id'];
    // await Comment.deleteMany({ userId: id })
    // await Reading.deleteMany({ userId: id })
    // await Novel.deleteMany({ nguoidangtruyen: id })
    next();
});

const User = mongoose.model('User', schema);
module.exports = User 