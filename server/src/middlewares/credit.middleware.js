import User from '../models/user.model.js';

/**
 * Middleware to check if user has credits or premium access
 * Deducts 1 credit if user is not premium and has credits
 */
const checkAndDeductCredit = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if user has premium that is still valid
    const isPremiumValid = user.isPremiumValid();
    
    if (isPremiumValid) {
      // Premium users can use features without credit deduction
      req.userCredits = user.credits;
      req.isPremium = true;
      return next();
    }

    // Check if user has credits
    if (user.credits <= 0) {
      return res.status(403).json({
        success: false,
        message: 'No credits remaining. Please upgrade to premium to continue using this feature.',
        credits: user.credits,
        isPremium: false,
        needsUpgrade: true,
      });
    }

    // Deduct 1 credit
    user.credits -= 1;
    await user.save();

    req.userCredits = user.credits;
    req.isPremium = false;
    next();
  } catch (error) {
    console.error('Error in credit middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export default checkAndDeductCredit;

