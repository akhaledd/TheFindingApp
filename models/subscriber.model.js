const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');

var subscriberSchema = new Schema({
  email: {
    type: String,
    required: String,
    unique: true
  },
  fullName: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

subscriberSchema.plugin(mongoose_delete, {
  deletedAt: true
});

const Subscribers = mongoose.model('Subscribers', subscriberSchema);

module.exports = Subscribers;