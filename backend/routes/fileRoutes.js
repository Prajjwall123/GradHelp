const express = require('express');
const router = express.Router();
const { serveLetter } = require('../controllers/fileController');



router.get('/letters/:filename', 
    (req, res, next) => serveLetter(req, res, next)
);

module.exports = router;
