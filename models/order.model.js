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
    ref: 'Products'
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
  },
  card_details: {
    country: {
      type: String,
      default: 'Unknown'
    },
    card_type: {
      type: String,
      default: 'Unknown'
    },
    exp_month: {
      type: Number,
      default: 0
    },
    exp_year: {
      type: Number,
      default: 0
    },
    funding: {
      type: String,
      default: 'Unknown'
    },
    last4: {
      type: String,
      default: 'Unknown'
    },
    clientIp: {
      type: String,
      default: '0.0.0.0'
    },
    name_on_card: {
      type: String,
      default: 'Unknown'
    },
    card_id: {
      type: String,
      default: 'Unknown'
    }
  },
  stripe_token: {
    type: String,
    default: 'Unknown'
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

orderSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: true
});

const Orders = mongoose.model('Orders', orderSchema);

module.exports = Orders;