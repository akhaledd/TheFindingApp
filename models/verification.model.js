const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');

var verificationSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  used: {
    type: Boolean,
    default: false,
    required: true
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

verificationSchema.plugin(mongoose_delete, {
  deletedAt: true
});

const Verification = mongoose.model('PasswordVerifications', verificationSchema);

module.exports = Verification;