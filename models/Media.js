const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    albumId: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true,
        ref:'Album'
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true,
        ref:'User'
    },
    filename: {
        type: String,
        require: true,
        default: "media-file",
        trim: true,
    },
    url: {
        type: String,
        require: true,
        default: "media-file",
        trim: true,
    },
    size: {
        type: Number,
        require: true,
        default: 0
    },
    extension: {
        type: String,
        require: true,
        default: 0
    },
    type: {
        type: String,
        enum:['image','video'],
        require: true,
        default: 'image'
    },
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Media', schema); 