const { default: mongoose } = require("mongoose");
const Album = require("../models/Album");
const Media = require("../models/Media");
const User = require("../models/User");
const { cloudinary } = require("../services/cloudinaryService");


module.exports.GetAlbumByUser = async (req, res) => {
    let username = req.auth?.username
    try {
        let user = await User.findOne({ username })
        let albums = await Album.find({ userId: user.id })

        return res.status(200).json({
            message: 'Successfull',
            content: [...albums]
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error" })
    }
}

module.exports.getUserWithCriteria = async (req, res) => {
    let { searchText, ascending } = req.body
    let pageSize = req.body.pageSize || 10
    let pageIndex = req.body.pageIndex || 0
    let sortBy = req.body.sortBy || 'username'
    try {
        let keyword = searchText
        ? {
            $or: [
                { username: { $regex: searchText, $options: "i" } },
                { name: { $regex: searchText, $options: "i" } },
            ],
        }
        : {};
        let users = await User.find(keyword)
            .skip(pageIndex > 0 ? (pageIndex - 1) * pageSize : 0)
            .limit(pageSize)
            .sort({ [sortBy]: Boolean(ascending) ? 1 : -1 })
        return res.status(200).json({
            message:'Successfull',
            content:users
        })
    }
    catch (err) {
        console.log(err)
    }
}
module.exports.GetMediaWithCriteria = async (req, res) => {
    let { searchText, ascending } = req.body
    let pageSize = req.body.pageSize || 10
    let pageIndex = req.body.pageIndex || 0
    let sortBy = req.body.sortBy || 'filename'
    try {
        let keyword = searchText
        ? {
            $or: [
                { filename: { $regex: searchText, $options: "i" } },
                { extension: { $regex: searchText, $options: "i" } },
            ],
        }
        : {};
        let listMedia = await Media.find(keyword)
            .skip(pageIndex > 0 ? (pageIndex - 1) * pageSize : 0)
            .limit(pageSize)
            .sort({ [sortBy]: ascending ? 1 : -1 })
        return res.status(200).json({
            message:'Successfull',
            content:listMedia
        })
    }
    catch (err) {
        console.log(err)
    }
}
module.exports.GetAlbumById = async (req, res) => {
    let { id } = req.query
    try {
        let album = await Album.findById(id)

        return res.status(200).json({
            message: 'Successfull',
            content: album
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error" })
    }
}

module.exports.DeleteAlbumByAdmin = async (req, res) => {
    let id = req.query.id;
    try {
        let deletedAlbum = await Album.findById(id)
        if (deletedAlbum) {
            let user = await User.findById(deletedAlbum.userId)

            let mediaInAlbum = await Media.find({ albumId: deletedAlbum.id })
            let public_ids = mediaInAlbum.map(media => 'media/' + media.id.toString())
            let totalSize = mediaInAlbum.reduce((total, media) => total + media.size, 0)
            let resultDeleteResource = await cloudinary.api.delete_resources(public_ids)
            console.log(resultDeleteResource)
            if (resultDeleteResource) {
                await Media.deleteMany({ albumId: deletedAlbum.id })
                let resultDeleteAlbum = await Album.deleteOne({ _id: deletedAlbum.id })
                user.currentUsage -= totalSize
                await user.save()

                if (resultDeleteAlbum.deletedCount === 1)
                    return res.status(200).json({ message: "Successful" })
            }
            return res.status(400).json({ message: "Fail" })
        }
        return res.status(400).json({ message: "Not found Album" })

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error" })
    }
}


module.exports.DeleteMediaByAdmin = async (req, res) => {
    let id = req.query.id;
    try {
        let deleteMedia = await Media.findById(id)

        let resultDeleteInCloud = await cloudinary.uploader.destroy('media/' + id)

        if (resultDeleteInCloud.result === 'ok') {
            let result = await Media.deleteOne({ _id: deleteMedia.id })

            if (result.deletedCount === 1) {
                await Album.updateOne({ _id: deleteMedia.albumId }, {
                    $inc: {
                        stogare: -deleteMedia.size
                    }
                }) //cập nhật dung lượng của album

                await User.updateOne({ _id: deleteMedia.userId },
                    { $inc: { currentUsage: -deleteMedia.size } }) // cập nhật dung lượng tổng dùng của user

                return res.status(200).json({ message: "Successful" })
            }
        }

        return res.status(400).json({ message: "Fail" })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error" })
    }
}


module.exports.DeleteAccountById = async (req, res) => {
    let id = req.query.id;
    try {
        let deletedUser = await User.findByIdAndUpdate(id, { data: { status: 'deleted' } })

        if (deletedUser)
            return res.status(200).json({ message: "Successful" })
        return res.status(400).json({ message: "Fail" })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error" })
    }
}
//module.exports = {getUserWithCriteria,GetAlbumByUser, GetAlbumById, DeleteAlbumByAdmin ,GetMediaWithCriteria,DeleteMediaByAdmin}