import mongoose from 'mongoose';
import User from './user';

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: User.modelName,
    required: [true, 'User id is required to save address'],
  },
  address: {
    type: String,
    required: [true, 'Address can\'t be empty'],
    minLength: [1, 'Address can\'t be empty'],
    maxLength: [300, 'Address can\'t exceed 300 characters'],
  },
  city: {
    type: String,
    required: [true, 'City can\'t be empty'],
    minLength: [1, 'City can\'t be empty'],
    maxLength: [50, 'City can\'t exceed 50 characters'],
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code can\'t be empty'],
    minLength: [1, 'Zip code can\'t be empty'],
    maxLength: [6, 'Zip code can\'t exceed 6 characters'],
  },
  state: {
    type: String,
    required: [true, 'State can\'t be empty'],
    minLength: [1, 'State can\'t be empty'],
  },
  country: {
    type: String,
    required: [true, 'Country can\'t be empty'],
    minLength: [1, 'Country can\'t be empty'],
  },
});

const ShippingAddress = mongoose.models.address || mongoose.model('address', addressSchema);

export default ShippingAddress;
