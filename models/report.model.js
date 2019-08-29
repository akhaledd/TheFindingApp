const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');

var reportSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  email: {
    type: String
  },
  fullName: {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    }
  },
  phone: {
    type: String
  },
  message: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

reportSchema.plugin(mongoose_delete, {
  deletedAt: true
});

const Reports = mongoose.model('Reports', reportSchema);

module.exports = Reports;