const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a firstName.'],
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a lastName.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    minlength: 8,
    required: [true, 'Please provide a password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // Cannot use arrow function because this is needed
      // This only works on SAVE and CREATE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  incomingPassword,
  userPassword
) {
  return await bcrypt.compare(incomingPassword, userPassword);
};

userSchema.methods.isPasswordChangedAfter = function (jwtTime) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTime < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
