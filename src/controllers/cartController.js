const Mongoose = require('mongoose');
const Cart = require('../models/cart');
const Item = require('../models/item');

exports.addItemToCart = async (req, res) => {
  const { productId } = req.body;
  const { _id } = req.user;
  const objectUser = new Mongoose.Types.ObjectId(_id);
  const objectProduct = new Mongoose.Types.ObjectId(productId);

  try {
    let cart = await Cart.findOne({ userId: _id });

    const productDetails = await Item.findById(productId);

    if (!productDetails) {
      return res.status(500).json({
        status: 'fail',
        msg: 'Product not found, invalid request!',
      });
    }

    if (cart) {
      // eslint-disable-next-line eqeqeq
      const indexFound = cart.items.findIndex((item) => item == productId);
      if (indexFound !== -1) {
        return res.status(500).json({
          status: 'fail',
          msg: 'Item already in cart',
        });
      }
      const data = await cart.updateOne({
        subTotal: cart.subTotal + productDetails.price,
        $push: { items: objectProduct },
      });
      return res.status(200).json({
        status: 'success',
        mgs: 'Item added to cart',
        data: data,
      });
    }

    const cartData = {
      userId: objectUser,
      items: [objectProduct],
      subTotal: productDetails.price,
    };
    cart = await await Cart.create(cartData);
    // let data = await cart.save();
    return res.status(200).json({
      status: 'success',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      msg: 'Error with cart API',
      err: err,
    });
  }
};

exports.getCart = async (req, res) => {
  const { _id } = req.user;

  try {
    const cart = await Cart.findOne({ userId: _id }).populate({
      path: 'items',
    });
    if (!cart) {
      return res.status(400).json({
        status: 'fail',
        msg: 'Cart not Found',
      });
    }
    res.status(200).json({
      status: true,
      data: cart,
    });
  } catch (err) {
    res.status(400).json({
      type: 'Invalid',
      msg: 'Something went wrong',
      err: err,
    });
  }
};

exports.deleteItemCart = async (req, res) => {
  const { _id } = req.user;
  const { productId } = req.body;
  const objectProduct = new Mongoose.Types.ObjectId(productId);

  try {
    const cart = await Cart.findOne({ userId: _id });
    if (!cart) {
      return res.status(400).json({
        status: 'fail',
        msg: 'Cart not Found',
      });
    }

    const data = await cart.updateOne({
      $pull: { items: objectProduct },
    });

    res.status(200).json({
      status: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      type: 'Invalid',
      msg: 'Something went wrong',
      err: err,
    });
  }
};
