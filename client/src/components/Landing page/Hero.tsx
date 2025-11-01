import { WavyBackground } from "../components/ui/wavy-background";


export default function Hero() {
  return (<>
    <WavyBackground className="max-w-4xl mx-auto pb-50 pt-20">
    <main className="relative flex flex-col items-center pt-12 pb-24">
      {/* Hero copy */}
      <h1 className="text-center text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white">
        AI-powered
        <br />
        communication coaching.
      </h1>
      <p className="mt-3 text-center text-sm sm:text-base text-neutral-300 max-w-md">
      Sparrow analyzes your voice and conversations to help you speak with clarity & confidence.
      </p>
      <button className="mt-4 inline-flex items-center rounded-full bg-neutral-100 text-black px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/80 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
        Start free trial
      </button>
    </main>
    </WavyBackground>
    </>
  )
}


