const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');

var productSchema = new Schema({
  displayName: {
    type: String,
    required: true,
    default: 'Not Set'
  },
  description: {
    type: String,
    required: true,
    default: 'Not Set'
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  onSale: {
    type: Boolean,
    required: true,
    default: false
  },
  afterSale: {
    type: Number,
    required: true,
    default: 0
  },
  mainImage: {
    type: String,
    required: true,
    default: 'https://via.placeholder.com/500x500'
  },
  otherImages: [{
    type: String
  }]
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

productSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: true
});

const Products = mongoose.model('Products', productSchema);

module.exports = Products;