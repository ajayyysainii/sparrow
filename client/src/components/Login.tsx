import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { SignInPage, type Testimonial } from './ui/sign-in';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password }
      );

      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleResetPassword = () => {
    alert('Password reset functionality coming soon!');
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  const sampleTestimonials: Testimonial[] = [
    // {
    //   avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    //   name: "Sarah Chen",
    //   handle: "@sarahdigital",
    //   text: "Amazing platform! The voice interactions are seamless and the AI responses are exactly what I needed."
    // },
    // {
    //   avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    //   name: "Marcus Johnson",
    //   handle: "@marcustech",
    //   text: "This service has transformed how I work. Clean design, powerful features, and excellent AI quality."
    // },
    // {
    //   avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    //   name: "David Martinez",
    //   handle: "@davidcreates",
    //   text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful."
    // },
  ];

  return (
    <SignInPage
      heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
      testimonials={sampleTestimonials}
      onSignIn={handleSubmit}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
};

export default Login;

