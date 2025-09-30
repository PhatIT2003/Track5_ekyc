const express = require('express');
const router = express.Router();
const { uploadController } = require('../controllers');

router.get('/upload/:url', uploadController.getOneSingleImage);

module.exports = router;
