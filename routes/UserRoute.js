const express = require('express')
const { VerifyToken } = require("../controllers/Verify")
const  UserController  = require('../controllers/UserController')
const router = express.Router();

router.post('', UserController.Register);
router.post('/login', UserController.Login);
router.post('/refresh-token', UserController.RefreshToken);
router.get('/infomation',VerifyToken, UserController.GetInfomation);
router.put('/infomation',VerifyToken, UserController.UpdateInfomation);
router.put('/password',VerifyToken, UserController.ChangePassword);
module.exports = router;