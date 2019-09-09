const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');

var tagSchema = new Schema({
  displayName: {
    type: String,
    required: true,
    default: 'New Tag'
  },
  assigned: {
    type: Boolean,
    default: false
  },
  activated: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: 'Not activated yet.'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  activationDate: {
    type: Date
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Products',
    required: true
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

tagSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: true
});

const Tags = mongoose.model('Tags', tagSchema);

module.exports = Tags;