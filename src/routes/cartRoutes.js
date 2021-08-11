const express = require('express');

const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(authController.protect, cartController.getCart)
  .delete(authController.protect, cartController.deleteItemCart);

router
  .route('/add-item-cart')
  .post(authController.protect, cartController.addItemToCart);

module.exports = router;
