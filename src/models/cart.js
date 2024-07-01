import mongoose from 'mongoose';
import Product from './product';
import User from './user';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: User.modelName,
    required: [true, 'User id is required for saving cart'],
  },
  products: [{
    productId: {
      type: mongoose.Types.ObjectId,
      ref: Product.modelName,
      required: [true, 'Product id of the item in cart is required'],
    },
    groupId: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Group id of the item in cart is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Ordered quantity can not be empty'],
    },
  }],
}, {
  timestamps: true,
});

const Cart = mongoose.models.carts || mongoose.model('carts', cartSchema);

export default Cart;
