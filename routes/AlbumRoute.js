const express = require('express')
const { VerifyToken, VerifyTokenOfAdmin } = require("../controllers/Verify")
const AlbumController = require('../controllers/AlbumController')
const router = express.Router();

router.post('',VerifyToken, AlbumController.CreateAlbum);
router.get('',VerifyToken, AlbumController.GetAlbumByUser);
router.get('/infomation',VerifyToken, AlbumController.GetAlbumById);
router.put('',VerifyToken, AlbumController.UpdateAlbumById);
router.delete('',VerifyToken,AlbumController.DeleteAlbumById)

module.exports = router;