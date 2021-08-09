const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  subTotal: {
    default: 0,
    type: Number,
  },
});
const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
