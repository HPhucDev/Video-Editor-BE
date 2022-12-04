const express = require('express')
const { VerifyToken, VerifyTokenOfAdmin } = require("../controllers/Verify")
const  AdminController  = require('../controllers/AdminController')
const router = express.Router();

router.post('/users',VerifyTokenOfAdmin, AdminController.getUserWithCriteria);
router.post('/media',VerifyTokenOfAdmin, AdminController.GetMediaWithCriteria);
router.delete('/album',VerifyTokenOfAdmin, AdminController.DeleteAlbumByAdmin);
router.delete('/media',VerifyTokenOfAdmin, AdminController.DeleteMediaByAdmin);

module.exports = router;