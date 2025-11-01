import image from "../assets/logo.png"

export default function Navbar() {
  return (
    <header className="relative z-20 w-full h-16 grid [grid-template-columns:1fr_auto_1fr] items-center px-6 gap-3">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
         <img src={image} alt="Sparrow" className="w-7 h-7 object-contain rounded-full" />
        <span className="text-[22px] font-semibold tracking-[0.2px]">Sparrow</span>
      </div>

      {/* Center: Pill nav */}
      <nav className="flex justify-center">
        <ul className="flex items-center gap-3 min-w-[300px] rounded-full border border-neutral-800 bg-neutral-900 px-1.5 py-1.5 shadow">
          <li className="px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800/100 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">Home</li>
          <li className="px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800/100 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">About us</li>
          <li className="px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800/100 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">Pricing</li>
          <li className="px-4 py-2 rounded-full text-neutral-300 whitespace-nowrap cursor-pointer transition-colors hover:bg-neutral-800/100 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">FAQs</li>
        </ul>
      </nav>

      {/* Right: Login pill */}
      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-full border border-neutral-800 bg-neutral-800 text-white shadow hover:bg-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
          Login
        </button>
      </div>
    </header>
  )
}


