const express = require('express')
const { VerifyToken, VerifyTokenOfAdmin } = require("../controllers/Verify")
const  MediaController = require('../controllers/MediaController')
const router = express.Router();

router.post('',VerifyToken, MediaController.CreateMedia);
router.get('/by-album',VerifyToken, MediaController.GetMediaByAlbumId);
router.get('/by-id',VerifyToken, MediaController.GetMediaById);
router.get('/statistic',VerifyToken, MediaController.GetStatisticMedia);
router.put('',VerifyToken, MediaController.UpdateMedia);
router.delete('',VerifyToken,MediaController.DeleteMediaById)

module.exports = router;