import { Link } from "react-router-dom";
import image from './../../assets/react.svg'

export default function Navbar() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative z-20 w-full h-16 grid grid-cols-[1fr_auto_1fr] items-center px-6 gap-3 bg-black">
      {/* Left: Brand */}
      <Link to="/" className="flex items-center gap-3 no-underline">
         <img src={image} alt="Sparrow" className="w-7 h-7 object-contain rounded-full" />
        <span className="text-[22px] font-semibold tracking-[0.2px] text-white">Sparrow</span>
      </Link>

      {/* Center: Pill nav */}
      <nav className="flex justify-center">
        <ul className="flex items-center gap-3 min-w-[300px] rounded-full border border-neutral-800 bg-neutral-900 px-1.5 py-1.5 shadow">
          <li 
            onClick={() => scrollToSection('hero')}
            className="px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            Home
          </li>
          <li 
            onClick={() => scrollToSection('about')}
            className="px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            About us
          </li>
          <li 
            onClick={() => scrollToSection('pricing')}
            className="px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            Pricing
          </li>
          <li 
            onClick={() => scrollToSection('faq')}
            className="px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            FAQs
          </li>
        </ul>
      </nav>

      {/* Right: Login pill */}
      <div className="flex justify-end">
        <Link 
          to="/login"
          className="px-4 py-2 rounded-full border border-neutral-800 bg-neutral-800 text-white shadow hover:bg-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 no-underline"
        >
          Login
        </Link>
      </div>
    </header>
  )
}


