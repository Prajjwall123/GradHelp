const express = require('express');
const router = express.Router();
const { serveLetter } = require('../controllers/fileController');



router.get('/letters/:filename', serveLetter);

module.exports = router;
