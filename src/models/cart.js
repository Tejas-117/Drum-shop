import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'users',
    required: [true, 'User id is required for saving cart'],
  },
  products: [{
    productId: {
      type: mongoose.Types.ObjectId,
      ref: 'products',
      required: [true, 'Product id of the item in cart is required'],
    },
    groupId: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Product id of the item in cart is required'],
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
