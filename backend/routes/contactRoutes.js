const express = require('express');
const router = express.Router();
const { submitContactForm, getContactMessages } = require('../controllers/contactController');


router.post('/', 
    (req, res, next) => submitContactForm(req, res, next)
);

router.get('/', 
    (req, res, next) => getContactMessages(req, res, next)
);

module.exports = router;
