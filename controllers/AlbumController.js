const { default: mongoose } = require("mongoose");
const Album = require("../models/Album");
const Media = require("../models/Media");
const User = require("../models/User");
const { cloudinary } = require("../services/cloudinaryService");


module.exports.CreateAlbum = async (req, res) => {
    let username = req.auth?.username
    let { name } = req.body
    try {
        let user = await User.findOne({ username })

        let newAlbum = new Album({ userId: user.id, name })

        await newAlbum.save();
        return res.status(200).json({
            message: "Successful",
            content: {
                id: newAlbum.id,
                name: newAlbum.name
            }
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Error" })
    }
}
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
module.exports.UpdateAlbumById = async (req, res) => {
    let username = req.auth?.username
    let { id, name } = req.body
    try {
        let user = User.findOne({ username })

        if (!user) return res.status(400).json({ message: "User dont exist" })

        let album = await Album.findById(id)

        if (album) {
            album.name = name
            await album.save()
            return res.status(200).json({
                message: 'Successful'
            })
        }
        return res.status(200).json({
            message: 'Fail'
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error" })
    }
}

module.exports.DeleteAlbumById = async (req, res) => {
    let username = req.auth?.username
    let id = req.query.id;
    try {
        let deletedAlbum= await Album.findById(id)
        let user = await User.findById(deletedAlbum.userId)
        if (deletedAlbum) {
            let mediaInAlbum = await Media.find({ albumId: deletedAlbum.id })
            let public_ids = mediaInAlbum.map(media => 'media/' + media.id.toString())
            let totalSize = mediaInAlbum.reduce((total, media) => total + media.size, 0)
            let resultDeleteResource = await cloudinary.api.delete_resources(public_ids)
            console.log(resultDeleteResource)
            if (resultDeleteResource) {
                await Media.deleteMany({ mediaId: deletedMedia.id })
                let resultDeleteAlbum = await Album.deleteOne({ _id: deletedMedia.id })
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