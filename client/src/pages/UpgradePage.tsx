import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Check, Crown, Sparkles, ArrowRight, Shield, Zap, BarChart3, Headphones, Infinity } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/payment/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!token) {
      alert('Please login to upgrade');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/payment/create-order`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // Load Razorpay script dynamically
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Voice Health Assistant',
        description: 'Premium Subscription (30 Days)',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/payment/verify`,
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            alert('Payment successful! Premium activated.');
            await loadSubscriptionStatus();
            // Refresh user data in auth context
            window.location.reload();
          } catch (error: any) {
            console.error('Payment verification failed:', error);
            alert(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const features = [
    { icon: Infinity, text: 'Unlimited Voice Health Checks' },
    { icon: BarChart3, text: 'Unlimited Call Reports & Analysis' },
    { icon: Zap, text: 'Premium AI Analysis & Insights' },
    { icon: Headphones, text: 'Priority Customer Support' },
    { icon: Shield, text: 'Advanced Analytics Dashboard' },
    { icon: Crown, text: '30 Days Full Access' },
    { icon: Sparkles, text: 'Bonus 3 Credits on Upgrade' },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1C1C1E] via-[#242426] to-[#1C1C1E] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto"
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300 tracking-tight">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            Unlock unlimited access to all features
            <br className="hidden md:block" />
            <span className="text-gray-300">for 30 days</span>
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="h-full backdrop-blur-xl bg-[rgba(44,44,46,0.6)] border-[rgba(255,255,255,0.1)] shadow-2xl">
              <CardHeader className="pb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-[rgba(255,255,255,0.1)] flex items-center justify-center backdrop-blur-sm">
                    <Shield className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold text-white">Current Plan</CardTitle>
                    <CardDescription className="text-base font-medium text-gray-400">
                      {subscriptionStatus?.isPremium ? 'Premium' : 'Free'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-white tracking-tight">
                    {subscriptionStatus?.credits ?? user?.credits ?? 0}
                  </p>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Remaining Credits
                  </p>
                </div>
                {subscriptionStatus?.isPremium && subscriptionStatus?.premiumExpiry && (
                  <div className="pt-6 border-t border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <p className="text-sm font-semibold text-green-400 uppercase tracking-wide">Premium Active</p>
                    </div>
                    <p className="text-xs text-gray-500 font-light">
                      Expires {new Date(subscriptionStatus.premiumExpiry).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {!subscriptionStatus?.isPremium && (
                  <div className="pt-6 border-t border-[rgba(255,255,255,0.1)]">
                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                      Limited features available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-[rgba(99,102,241,0.15)] via-[rgba(139,124,246,0.1)] to-[rgba(139,124,246,0.15)] border-2 border-[rgba(139,124,246,0.3)] shadow-2xl shadow-purple-500/20">
              {/* Premium Badge */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase shadow-lg">
                Best Value
              </div>
              
              <CardHeader className="pb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold text-white">Premium Plan</CardTitle>
                    <CardDescription className="text-base font-medium text-gray-300">
                      30 days of unlimited access
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8 pb-8">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-light text-white tracking-tight">₹499</p>
                  </div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    One-time Payment
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-[rgba(139,124,246,0.3)] group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition-all duration-300">
                        <Check className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-200 leading-relaxed pt-1">
                        {feature.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    onClick={handleUpgrade}
                    disabled={loading || subscriptionStatus?.isPremium}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-base shadow-xl shadow-purple-500/30 border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    size="lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Processing...
                      </span>
                    ) : subscriptionStatus?.isPremium ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Already Premium
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Upgrade Now
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-2xl px-8 py-6 font-medium transition-all duration-300"
          >
            ← Back to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UpgradePage;

