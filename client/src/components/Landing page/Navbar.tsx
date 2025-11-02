import { Link } from "react-router-dom";
import { useState } from "react";
import image from './../../assets/logo.png'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="relative z-20 w-full h-16 flex items-center justify-between px-4 sm:px-6 gap-3 bg-transparent mix-blend-screen backdrop-blur-sm">
      {/* Left: Brand */}
      <Link to="/" className="flex items-center gap-2 sm:gap-3 no-underline flex-shrink-0">
        <span className="text-lg sm:text-[22px] font-semibold tracking-[0.2px] text-white">Sparrow</span>
      </Link>

      {/* Center: Pill nav - Hidden on mobile */}
      <nav className="hidden md:flex justify-center flex-1">
        <ul className="flex items-center gap-2 lg:gap-3 rounded-full border border-neutral-800 bg-neutral-900 px-1.5 py-1.5 shadow">
          <li 
            onClick={() => scrollToSection('hero')}
            className="px-3 lg:px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-sm lg:text-base"
          >
            Home
          </li>
          <li 
            onClick={() => scrollToSection('about')}
            className="px-3 lg:px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-sm lg:text-base"
          >
            About us
          </li>
          <li 
            onClick={() => scrollToSection('pricing')}
            className="px-3 lg:px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-sm lg:text-base"
          >
            Pricing
          </li>
          <li 
            onClick={() => scrollToSection('faq')}
            className="px-3 lg:px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-sm lg:text-base"
          >
            FAQs
          </li>
        </ul>
      </nav>

      {/* Right: Login pill and Mobile menu button */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <Link 
          to="/login"
          className="hidden sm:block px-4 py-2 rounded-full border border-neutral-800 bg-neutral-800 text-white shadow hover:bg-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 no-underline text-sm"
        >
          Login
        </Link>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-full border border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800 md:hidden">
          <nav className="flex flex-col px-4 py-4 gap-2">
            <button
              onClick={() => scrollToSection('hero')}
              className="w-full text-left px-4 py-3 rounded-lg text-white hover:bg-neutral-800 transition-colors text-base"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="w-full text-left px-4 py-3 rounded-lg text-white hover:bg-neutral-800 transition-colors text-base"
            >
              About us
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="w-full text-left px-4 py-3 rounded-lg text-white hover:bg-neutral-800 transition-colors text-base"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="w-full text-left px-4 py-3 rounded-lg text-white hover:bg-neutral-800 transition-colors text-base"
            >
              FAQs
            </button>
            <Link
              to="/login"
              className="w-full text-center px-4 py-3 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors text-base font-semibold no-underline mt-2"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}


