const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/logout', authController.logout);
router.get('/isLoggedIn', authController.isLoggedIn);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;
