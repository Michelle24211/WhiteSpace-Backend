const express = require('express');

const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(authController.protect, cartController.getCart)
  .post(authController.protect, cartController.addItemToCart)
  .delete(authController.protect, cartController.deleteItemCart);

module.exports = router;
