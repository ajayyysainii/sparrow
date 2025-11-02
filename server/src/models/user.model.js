import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  credits: {
    type: Number,
    default: 3,
    min: 0,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumExpiry: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if premium is valid
userSchema.methods.isPremiumValid = function() {
  if (!this.isPremium || !this.premiumExpiry) {
    return false;
  }
  return new Date() < this.premiumExpiry;
};

// Method to check if user can use feature (has credits or premium)
userSchema.methods.canUseFeature = function() {
  return this.isPremiumValid() || this.credits > 0;
};

const User = mongoose.model('User', userSchema);

export default User;

