const Album = require("../models/Album");
const User = require("../models/User");
const cloudinary = require('cloudinary').v2
const dotenv = require('dotenv');
const Media = require("../models/Media");
const { default: mongoose } = require("mongoose");
dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports.CreateMedia = async (req, res) => {
    let username = req.auth?.username
    let { albumId, filename, type } = req.body
    let file = req.files?.file
    try {
        let user = await User.findOne({ username })

        let album = await Album.findById(albumId)

        if (file) {

            let { mimetype, size, data } = file
            let dataBase64 = data.toString('base64')
            size = file.size / 1000 //chuyển từ byte sang kb
            let dataUri = `data:${mimetype};base64,${dataBase64}`//chuyển sang data uri

            user.currentUsage += size
            album.stogare += size

            if (user.currentUsage > user.stogare)//kiểm tra dung lượng sử dụng
                return res.status(400).json({
                    message: 'Không đủ dung lượng'
                })

            let newMedia = new Media({
                userId: user.id,
                albumId: album.id,
                filename,
                size,
                type,
                extension: mimetype,
            })

            let optionsUpload = { folder: "media/", public_id: newMedia.id.toString() }
            let uploadInfo = await cloudinary.uploader.upload(dataUri, optionsUpload)

            newMedia.url = uploadInfo.secure_url
            await newMedia.save()
            await album.save()
            await user.save()

            return res.status(200).json({
                message: 'Successful',
                content: newMedia
            })
        }
        else {
            return res.status(400).json({ message: "Không có hình ảnh tải lên" })
        }

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Error" })
    }
}
module.exports.UpdateMedia = async (req, res) => {
    let username = req.auth?.username
    let { filename, type, id } = req.body
    let file = req.files?.file
    try {
        let user = await User.findOne({ username })
        let currentMedia = await Media.findById(id)

        if (currentMedia) {
            if (file) {

                let { mimetype, size, data } = file
                let dataBase64 = data.toString('base64')
                size = file.size / 1000 //chuyển từ byte sang kb
                let dataUri = `data:${mimetype};base64,${dataBase64}`//chuyển sang data uri

                user.currentUsage = user.currentUsage - currentMedia.size + size
                if (user.currentUsage > user.stogare)//kiểm tra dung lượng sử dụng
                    return res.status(400).json({
                        message: 'Không đủ dung lượng'
                    })

                let optionsUpload = { folder: "media/", public_id: id }
                let uploadInfo = await cloudinary.uploader.upload(dataUri, optionsUpload)

                await Album.updateOne({ _id: currentMedia.albumId }, {
                    $inc: {
                        stogare: size - currentMedia.size
                    }
                }) //cập nhật dung lượng của album

                let newMedia = await Media.findByIdAndUpdate(id, {
                    filename,
                    type,
                    extension: mimetype,
                    size,
                    url: uploadInfo.secure_url
                }, { new: true }) //cập nhật lại media

                await user.save()

                return res.status(200).json({
                    message: 'Successful',
                    content: newMedia
                })
            }
            else {
                return res.status(400).json({ message: "Không có hình ảnh tải lên" })
            }
        }
        else {
            return req.status(400).json({ message: 'Media not found' })
        }



    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Error" })
    }
}
module.exports.GetMediaByAlbumId = async (req, res) => {
    let username = req.auth?.username
    let { albumId } = req.query
    try {
        let user = await User.findOne({username})
        let mediaInAlbum = await Media.find({ albumId: mongoose.Types.ObjectId(albumId) })

        return res.status(200).json({
            message: 'Successfull',
            content: mediaInAlbum
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error" })
    }
}
module.exports.GetMediaById = async (req, res) => {
    let username = req.auth?.username
    let id = req.query.id
    try {
        let user = await User.findOne({ username })
        let media = await Media.findById(id)

        if (media.userId.toString() !== user.id.toString())
            return res.status(403).json({ message: 'Forbidden' })

        return res.status(200).json({
            message: 'Successfull',
            content: media
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error" })
    }
}

module.exports.DeleteMediaById = async (req, res) => {
    let username = req.auth?.username
    let id = req.query.id;
    try {
        let user = await User.findOne({ username })
        let deleteMedia = await Media.findById(id)

        if (deleteMedia.userId.toString() !== user.id.toString())
            return res.status(403).json({ message: 'Forbidden' })

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


module.exports.GetStatisticMedia = async (req, res) => {
    try {

        let allMedia = await Media.find()
        let totalStogare = allMedia.reduce((total, current) => total + current.size, 0)
        return res.status(200).json({
            message: 'Successfull',
            content: {
                count: allMedia.length,
                totalStogare
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error" })
    }
}
