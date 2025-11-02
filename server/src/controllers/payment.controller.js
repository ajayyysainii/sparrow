import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/user.model.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export class PaymentController {
  // Create order for premium subscription
  createOrder = async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Premium price in paise (₹499 = 49900 paise)
      const amount = 49900; // ₹499 for 30 days premium
      const currency = 'INR';

      // Create a short receipt ID (max 40 chars for Razorpay)
      // Format: P + last 8 chars of userId + last 8 digits of timestamp
      const userIdStr = userId.toString();
      const shortUserId = userIdStr.slice(-8); // Last 8 characters of ObjectId
      const shortTimestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
      const receipt = `P${shortUserId}${shortTimestamp}`; // Max 17 characters

      const options = {
        amount: amount,
        currency: currency,
        receipt: receipt,
        notes: {
          userId: userId.toString(),
          type: 'premium_subscription',
          duration: '30_days',
        },
      };

      const order = await razorpay.orders.create(options);

      res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create order',
      });
    }
  };

  // Verify payment and activate premium
  verifyPayment = async (req, res) => {
    try {
      const { orderId, paymentId, signature } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      if (!orderId || !paymentId || !signature) {
        return res.status(400).json({ message: 'Payment details are required' });
      }

      // Verify payment signature
      const text = `${orderId}|${paymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (generatedSignature !== signature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(paymentId);
      
      if (payment.status !== 'authorized' && payment.status !== 'captured') {
        return res.status(400).json({ message: 'Payment not successful' });
      }

      // Update user to premium
      const premiumExpiry = new Date();
      premiumExpiry.setDate(premiumExpiry.getDate() + 30); // 30 days from now

      const user = await User.findByIdAndUpdate(
        userId,
        {
          isPremium: true,
          premiumExpiry: premiumExpiry,
          $inc: { credits: 3 }, // Add 3 bonus credits
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Premium activated successfully',
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
      console.error('Error verifying payment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify payment',
      });
    }
  };

  // Get user subscription status
  getSubscriptionStatus = async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if premium is still valid
      const isPremiumValid = user.isPremiumValid();

      res.status(200).json({
        credits: user.credits,
        isPremium: isPremiumValid,
        premiumExpiry: user.premiumExpiry,
        canUseFeature: user.canUseFeature(),
      });
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch subscription status',
      });
    }
  };
}

