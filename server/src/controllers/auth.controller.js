import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export class AuthController {
  signup = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create new user
      const user = await User.create({ name, email, password });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Reload user to get default credits
      const newUser = await User.findById(user._id).select('-password');
      
      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          credits: newUser.credits,
          isPremium: newUser.isPremiumValid(),
          premiumExpiry: newUser.premiumExpiry,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          credits: user.credits,
          isPremium: user.isPremiumValid(),
          premiumExpiry: user.premiumExpiry,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  getMe = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          credits: user.credits,
          isPremium: user.isPremiumValid(),
          premiumExpiry: user.premiumExpiry,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

