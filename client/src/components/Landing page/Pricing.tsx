import { useState } from 'react'

const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

interface FeatureItemProps {
  text: string
  isDark?: boolean
  index: number
}

const FeatureItem = ({ text, isDark = false, index }: FeatureItemProps) => (
  <li 
    className="flex items-start gap-3 text-[15px] leading-relaxed mb-4 animate-fade-in"
    style={{
      animationDelay: `${index * 50}ms`,
      animationFillMode: 'both'
    }}
  >
    <div className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-white' : 'text-neutral-700'}`}>
      <CheckIcon className={isDark ? "w-5 h-5 text-white" : "w-5 h-5 text-neutral-900"} />
    </div>
    <span className={isDark ? "text-neutral-200" : "text-neutral-600"}>{text}</span>
  </li>
)

export default function Pricing() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const commonFeatures = [
    "Web site of the restaurant",
    "Delivery & Takeaway",
    "Contactless QR Table Ordering",
    "Online Payments (Credit cards / Apple / Google Pay)",
  ]

  return (
    <section className="relative w-full bg-black text-white px-6 py-24 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-neutral-950 opacity-50" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Main Title with Apple-style typography */}
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white mb-6 tracking-tight">
            Plans and pricing
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto" />
        </div>

        {/* Pricing Cards with Apple design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Standard Card */}
          <div 
            className="group relative flex flex-col p-10 rounded-3xl bg-white/5 backdrop-blur-2xl text-white border border-white/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2"
            onMouseEnter={() => setHoveredCard('standard')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              transform: hoveredCard === 'standard' ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/0 via-white/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Standard</h3>
              <div className="mb-4">
                <span className="text-5xl font-light text-white tracking-tight">$30</span>
                <span className="text-lg font-normal text-white/60 ml-2">per month</span>
              </div>
              <p className="text-[15px] text-white/70 mb-8 leading-relaxed">
                The customer support plan for individuals, startups, and small businesses.
              </p>
              <ul className="mb-10">
                {commonFeatures.map((feature, index) => (
                  <FeatureItem key={index} text={feature} index={index} />
                ))}
              </ul>
              <button className="mt-auto w-full py-4 bg-white text-black rounded-2xl font-medium text-[15px] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/20">
                View all features
              </button>
            </div>
          </div>

          {/* Smart Card (Popular) - Elevated with gradient */}
          <div 
            className="group relative flex flex-col p-10 rounded-3xl bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-transparent backdrop-blur-2xl text-white border border-purple-500/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-3 scale-105 md:scale-100"
            onMouseEnter={() => setHoveredCard('smart')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              transform: hoveredCard === 'smart' ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1.05)',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Popular Badge with glow */}
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-purple-500/50 z-20">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
              </svg>
              Popular
            </div>
            
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Smart</h3>
              <div className="mb-4">
                <span className="text-5xl font-light text-white tracking-tight">$65</span>
                <span className="text-lg font-normal text-white/60 ml-2">per month</span>
              </div>
              <p className="text-[15px] text-white/70 mb-8 leading-relaxed">
                The customer support plan for individuals, startups, and small businesses.
              </p>
              <ul className="mb-10">
                <FeatureItem text="Everything in Standard, plus:" isDark={true} index={0} />
                {commonFeatures.map((feature, index) => (
                  <FeatureItem key={index} text={feature} isDark={true} index={index + 1} />
                ))}
              </ul>
              <button className="mt-auto w-full py-4 bg-white text-black rounded-2xl font-medium text-[15px] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/30">
                View all features
              </button>
            </div>
          </div>

          {/* Pro Card */}
          <div 
            className="group relative flex flex-col p-10 rounded-3xl bg-white/5 backdrop-blur-2xl text-white border border-white/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2"
            onMouseEnter={() => setHoveredCard('pro')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              transform: hoveredCard === 'pro' ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/0 via-white/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Pro</h3>
              <div className="mb-4">
                <span className="text-5xl font-light text-white tracking-tight">$95</span>
                <span className="text-lg font-normal text-white/60 ml-2">per month</span>
              </div>
              <p className="text-[15px] text-white/70 mb-8 leading-relaxed">
                The customer support plan for individuals, startups, and small businesses.
              </p>
              <ul className="mb-10">
                <FeatureItem text="Everything in Standard and Smart, plus:" index={0} />
                {commonFeatures.map((feature, index) => (
                  <FeatureItem key={index} text={feature} index={index + 1} />
                ))}
                <FeatureItem text="Delivery & Takeaway" index={commonFeatures.length + 1} />
              </ul>
              <button className="mt-auto w-full py-4 bg-white text-black rounded-2xl font-medium text-[15px] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/20">
                View all features
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </section>
  )
}

