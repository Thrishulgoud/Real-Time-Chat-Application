const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  content: {
    type: String,
    required: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEncrypted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Encrypt message content before saving
messageSchema.pre('save', function(next) {
  if (this.isEncrypted && !this.isEncrypted) {
    this.content = CryptoJS.AES.encrypt(
      this.content,
      process.env.MESSAGE_ENCRYPTION_KEY
    ).toString();
  }
  next();
});

// Decrypt message content when retrieving
messageSchema.methods.decryptMessage = function() {
  if (this.isEncrypted) {
    const bytes = CryptoJS.AES.decrypt(
      this.content,
      process.env.MESSAGE_ENCRYPTION_KEY
    );
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  return this.content;
};

module.exports = mongoose.model('Message', messageSchema);