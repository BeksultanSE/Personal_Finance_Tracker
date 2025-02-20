const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 50 // limiting name length
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true, 
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] // email validation
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 // minimum password length
  },
  role: { 
    type: String, 
    enum: ['admin', 'user'], 
    default: 'user' 
  }, 
  isActivated: { 
    type: Boolean, 
    default: false 
  },
  activationLink: { 
    type: String, 
    default: null // default value for activationLink
  }
}, { timestamps: true });

// Pre-save hook to hash the password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
