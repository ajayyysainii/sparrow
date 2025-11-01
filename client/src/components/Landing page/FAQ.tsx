import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={onToggle}
        className="group w-full py-6 px-6 md:px-8 flex items-center justify-between text-left 
                   hover:bg-white/5 active:bg-white/10 
                   transition-all duration-200 ease-out"
        aria-expanded={isOpen}
      >
        <span className="text-base md:text-lg font-semibold text-white pr-8 
                         group-hover:text-gray-300 transition-colors duration-200">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 
                      transition-all duration-300 ease-out
                      group-hover:text-gray-300
                      ${isOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out
                    ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="px-6 md:px-8 pb-6 text-sm md:text-base text-gray-400 leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const AppleFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: "What is Sparrow?",
      answer: "This FAQ component features clean typography with SF Pro Display font, generous spacing, smooth animations, and a dark minimalist aesthetic that reflects Apple's modern design language. The fluid transitions create an elegant, premium user experience."
    },
    {
      question: "How does Sparrow help me improve?",
      answer: "The component uses CSS transitions with custom ease-out timing for buttery-smooth animations. The chevron icon rotates 180 degrees, while the answer section expands with coordinated height and opacity changes, creating that signature Apple feel."
    },
    {
      question: "Is my voice data private?",
      answer: "Absolutely! The component is built with Tailwind CSS utility classes and uses CSS custom properties for the SF Pro Display font. You can easily adjust colors, spacing, typography, and animations to match your brand while maintaining the smooth interaction patterns."
    },
    {
      question: "Who can use Sparrow?",
      answer: "Yes, the component uses semantic HTML with proper button elements for keyboard navigation. Users can tab through questions and press Enter or Space to expand them. The high contrast dark mode design and clear hierarchy support all users, including those using assistive technologies."
    },
    {
      question: "Do I need any special equipment? ",
      answer: "The component is fully responsive and touch-optimized. The generous tap targets, smooth 60fps animations, and adaptive layout work seamlessly across all devices, from the latest iPhones to desktop displays, maintaining that premium Apple experience everywhere."
    }
  ];

  const handleToggle = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-black font-sans antialiased">
      <style>{`
        * {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
        }
      `}</style>
      
      <div className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section with gradient text */}
          <div className="text-center mb-12 md:mb-20 space-y-4 md:space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white 
                           tracking-tight leading-tight
                           bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500
                           animate-in fade-in slide-in-from-bottom-4 duration-700">
              Frequently Asked Questions
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto" />
          </div>

          {/* FAQ List with glassmorphism */}
          <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            {/* Main container */}
            <div className="relative bg-gradient-to-b from-gray-900/90 to-gray-900/50 
                            rounded-3xl shadow-2xl overflow-hidden 
                            backdrop-blur-2xl border border-white/10">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))}
            </div>
          </div>

          {/* Footer CTA with modern button */}
          <div className="text-center mt-12 md:mt-16 space-y-6 md:space-y-8
                          animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
            <p className="text-base md:text-lg text-gray-400 font-medium">
              Still have questions?
            </p>
            <button className="group relative px-8 md:px-10 py-3 md:py-4 
                               bg-white text-black rounded-full 
                               font-semibold text-sm md:text-base
                               shadow-lg shadow-white/20
                               hover:shadow-xl hover:shadow-white/30
                               hover:bg-gray-100 hover:-translate-y-0.5
                               active:translate-y-0 active:scale-95
                               transition-all duration-200 ease-out
                               overflow-hidden">
              {/* Button shine effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent 
                               -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative">Contact Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppleFAQ;