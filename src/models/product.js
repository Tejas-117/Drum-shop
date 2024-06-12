import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: [true, 'Product code is required'],
    trim: true,
    minLength: [1, 'Product code can\'t be empty'],
    maxLength: [20, 'Product code can\'t exceed 20 characters'],
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minLength: [1, 'Product name can\'t be empty'],
  },
  division: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand of the product is required'],
    trim: true,
    minLength: [1, 'Brand can\'t be empty'],
    maxLength: [50, 'Brand can\'t exceed 50 characters'],
  },
  color: {
    type: String,
    required: [true, 'Specify the color of the product'],
    minLength: [1, 'Product color can\'t be empty']
  },
  model: {
    type: String,
    required: [true, 'Model(SKU) of the product is required'],
  },
  groupId: {
    type: String,
  }, 
  quantity: {
    type: Number
  },
  costPrice: {
    type: Number
  },
  sellingPrice: {
    type: Number
  },
  cgst: {
    type: Number
  },
  sgst: {
    type: Number
  },
  discount: {
    type: Number
  },
  mrp: {
    type: Number
  },
  hsn_code: {
    type: Number
  },
  description: {
    type: String
  },
  specification: {
    type: String
  },
});

const Product = mongoose.models.products || mongoose.model('products', productSchema);

export default Product;