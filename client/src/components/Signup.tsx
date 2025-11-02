import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import DarkVeil from './DarkVeil';



const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 focus-within:border-white/20 focus-within:bg-white/10 focus-within:shadow-lg focus-within:shadow-white/5"
    >
      {children}
    </motion.div>
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        { name, email, password }
      );

      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <DarkVeil />
      </div>
      <div className="relative z-10 mix-blend-screen">
        <div className="h-[100dvh] w-[100dvw] relative overflow-hidden bg-transparent">
          {/* Logo/Brand area - Left positioned */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 z-20"
          >
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white tracking-tight">
              Sparrow
            </h1>
          </motion.div>

          {/* Main content */}
          <div className="relative h-full flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="w-full max-w-md mx-auto px-2 sm:px-0"
            >
              {/* Glass morphism container */}
              <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20 p-6 sm:p-8 md:p-10">
                {/* Title */}
                <motion.h1
                  variants={itemVariants}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-3 sm:mb-4 tracking-tight leading-none"
                >
                  <span className="font-light text-white tracking-[-0.02em]">
                    Create your account
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-base sm:text-lg text-white/60 mb-6 sm:mb-8 md:mb-10 font-light"
                >
                  Join us and start your journey today
                </motion.p>

                {/* Form */}
                <motion.form
                  variants={itemVariants}
                  className="space-y-4 sm:space-y-5 md:space-y-6"
                  onSubmit={handleSubmit}
                >
            {/* Name Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-white/80 px-1">
                Full Name
              </label>
              <GlassInputWrapper>
                <motion.input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-transparent text-white placeholder:text-white/30 text-sm sm:text-base px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl focus:outline-none font-light"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  required
                />
              </GlassInputWrapper>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-white/80 px-1">
                Email
              </label>
              <GlassInputWrapper>
                <motion.input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-transparent text-white placeholder:text-white/30 text-sm sm:text-base px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl focus:outline-none font-light"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  required
                />
              </GlassInputWrapper>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-white/80 px-1">
                Password
              </label>
              <GlassInputWrapper>
                <div className="relative">
                  <motion.input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 6 characters)"
                    className="w-full bg-transparent text-white placeholder:text-white/30 text-sm sm:text-base px-4 sm:px-5 py-3 sm:py-4 pr-10 sm:pr-12 rounded-xl sm:rounded-2xl focus:outline-none font-light"
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    minLength={6}
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 sm:right-4 flex items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 hover:text-white/80 transition-colors" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 hover:text-white/80 transition-colors" />
                    )}
                  </motion.button>
                </div>
              </GlassInputWrapper>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl sm:rounded-2xl bg-white text-black py-3 sm:py-4 text-sm sm:text-base font-medium hover:bg-white/90 transition-all duration-300 shadow-lg shadow-white/10 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">{loading ? 'Creating account...' : 'Create Account'}</span>
              {!loading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.button>
          </motion.form>

                {/* Login Link */}
                <motion.p
                  variants={itemVariants}
                  className="text-center text-xs sm:text-sm text-white/50 mt-6 sm:mt-8 font-light px-2"
                >
                  Already have an account?{' '}
                  <motion.a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/login');
                    }}
                    className="text-white hover:text-white/80 transition-colors underline underline-offset-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign in
                  </motion.a>
                </motion.p>
              </div>
              {/* End of glass morphism container */}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

