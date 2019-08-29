const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');

const orderSchema = new Schema({
  totalPrice: {
    type: Number,
    required: true
  },
  subTotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    required: true
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tags'
  }],
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Users'
  },
  status: {
    required: true,
    type: String,
    default: 'Pending'
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

orderSchema.plugin(mongoose_delete, {
  deletedAt: true
});

const Orders = mongoose.model('Orders', orderSchema);

module.exports = Orders;