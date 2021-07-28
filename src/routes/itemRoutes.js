const express = require('express');

const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(itemController.uploadItemPhoto, itemController.createItem)
  .get(itemController.getAllItem);

router
  // router.param('id', middleware);
  .route('/:id')
  .get(itemController.getItem)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    itemController.deleteItem
  );

module.exports = router;
