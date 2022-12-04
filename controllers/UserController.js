const User = require('../models/User.js')
const jwt = require("jsonwebtoken");
const md5 = require('md5');
const moment = require('moment')

const generateAccessToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1h" })
}

const generateRefreshToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1d" })
}


module.exports.Register = async (req, res) => {
    let { name, username, password } = req.body
    try {
        let newUser = new User({
            name,
            username,
            password: md5(password),
            birthday: moment().subtract(18, 'years').toDate()
        });

        let error = newUser.validateSync();
        if (error)
            return res.status(400).json({
                message: 'Validation Error'
            })

        await newUser.save();
        return res.status(200).json({
            message: "Successful"
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Error" })
    }
}
module.exports.Login = async (req, res) => {
    let { username, password } = req.body
    try {
        let user = await User.findOne({ username: username})
        if (!user) return res.status(400).json({ username: "Sai tên đăng nhập hoặc mật khẩu" })

        if(user.status === 'deleted') return res.status(400).json({ username: "Tài khoản đã bị xoá" })

        if (md5(password) === user.password) {
            if (user.status !== 'active') {
                return res.status(403).json({ message: "Tài khoản của bạn chưa được kích hoạt." })
            }

            let dataToken = {
                username: user.username,
                role: user.role
            };
            let accessToken = generateAccessToken(dataToken);
            let refreshToken = generateRefreshToken(dataToken);
            let { password, id, status, ...data } = user._doc;

            return res.status(200).json({
                message: 'Successful',
                content: {
                    accessToken,
                    refreshToken,
                    ...data
                }
            });
        }
        return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu" })

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error" })
    }
}

module.exports.RefreshToken = async (req, res) => {
    let refreshToken = req.body.refreshToken;
    try {
        if (!refreshToken) {
            return res.status(401).json({ message: "Empty Token" })
        }

        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.log("Lỗi:" + err)
                return res.status(500).json({ message: "Wrong Token" })
            }
            else {
                let { iat, exp, ...data } = user;
                let newAccessToken = generateAccessToken(data);
                let newRefreshToken = generateRefreshToken(data);

                return res.status(200).json({
                    message: 'Successful',
                    content: {
                        refreshToken: newRefreshToken,
                        accessToken: newAccessToken
                    }
                });
            }
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Error' })
    }
}
module.exports.GetInfomation = async (req, res) => {
    let username = req.auth?.username
    try {
        let user = await User.findOne({ username })

        let { password, status, ...rest } = user._doc;

        return res.status(200).json({
            message: 'Successfull',
            content: { ...rest }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error" })
    }
}

module.exports.UpdateInfomation = async (req, res) => {
    let username = req.auth?.username
    let { name, birthday, gender } = req.body
    try {

        if (birthday === null || new Date(birthday).toLocaleString() === "Invalid Date") {
            return res.status(400).json({ message: "Ngày sinh không hợp lệ" })
        }
        let newUser = await User.findOneAndUpdate({ username: username }, { name, birthday, gender }, { new: true })
        let { password, ...info } = newUser._doc
        return res.status(200).json({
            message: 'Successful',
            content: { ...info }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error" })
    }
}

module.exports.ChangePassword = async (req, res) => {
    let username = req.auth?.username
    let { password, newPassword } = req.body
    try {
        let user = await User.findOne({ username })

        if (md5(password) === user.password) {
            let updatedUser = await User.findOneAndUpdate({ username }, { password: md5(newPassword) }, { new: true })
            if (updatedUser) return res.status(200).json({ message: "Successful" })
            return res.status(400).json({ message: "Fail" })
        }
        return res.status(400).json({ message: "Unauthorization" })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error" })
    }
}
