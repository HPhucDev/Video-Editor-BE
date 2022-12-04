const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true,
        ref:'User'
    },
    name: {
        type: String,
        require: true,
        default: "",
        trim: true,
        validate: {
            validator: value => value.length <= 50,
            message: "Tên album phải ngắn hơn 50 ký tự"
        }
    },
    stogare: {
        type: Number,
        require: true,
        default: 0
    },
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Album', schema); 