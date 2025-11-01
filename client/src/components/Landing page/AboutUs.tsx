import { useState } from 'react'

interface StatCardProps {
  icon: React.ReactNode
  number: string
  label: string
  index: number
}

const StatCard = ({ icon, number, label, index }: StatCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative flex flex-col items-start p-10 rounded-3xl bg-white/5 backdrop-blur-2xl text-white border border-white/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both',
        transform: isHovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
      }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/0 via-white/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 w-full">
        {/* Icon */}
        <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-12 h-12 text-white">
            {icon}
          </div>
        </div>
        
        {/* Number */}
        <div className="mb-3">
          <span className="text-6xl font-light text-white tracking-tight leading-none block">
            {number}
          </span>
        </div>
        
        {/* Label */}
        <div>
          <span className="text-lg text-white/70 font-medium tracking-tight">
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AboutUs() {
  return (
    <section className="relative w-full bg-black text-white px-6 py-24 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-neutral-950 opacity-50" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Main Title with Apple-style typography */}
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white mb-6 tracking-tight">
            About Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-6" />
          <p className="text-lg sm:text-xl text-white/60 font-light tracking-tight max-w-2xl mx-auto leading-relaxed">
            Lets know more about us.
          </p>
        </div>

        {/* Cards Section with Apple design */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 (Top-Left): Projects Completed */}
          <StatCard
            index={0}
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            number="100+"
            label="Projects Completed"
          />

          {/* Card 2 (Top-Right): Guidelines Created */}
          <StatCard
            index={1}
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            number="350+"
            label="Guidelines Created"
          />

          {/* Card 3 (Bottom-Left): Trusted Partners */}
          <StatCard
            index={2}
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            number="90+"
            label="Trusted Partners"
          />

          {/* Card 4 (Bottom-Right): Years of Experience */}
          <StatCard
            index={3}
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            number="08+"
            label="Years of Experience"
          />
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </section>
  )
}

