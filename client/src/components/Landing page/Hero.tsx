import { Link } from "react-router-dom";
// import { WavyBackground } from "./ui/wavy-background";
import { WebGLShader } from "../wave.jsx";

export default function Hero() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <WebGLShader />
      </div>
      {/* <WavyBackground className="max-w-4xl mx-auto pb-50 pt-20"> */}
      <main className="relative z-10 flex flex-col items-center justify-center h-full pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6">
        {/* Hero copy */}
        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white px-2">
          AI-powered
          <br />
          communication coaching.
        </h1>
        <p className="mt-4 sm:mt-6 text-center text-sm sm:text-base md:text-lg text-neutral-300 max-w-md px-4 leading-relaxed">
          Sparrow analyzes your voice and conversations to help you speak with clarity & confidence.
        </p>
        <Link 
          to="/signup"
          className="mt-6 sm:mt-8 inline-flex items-center rounded-full bg-neutral-100 text-black px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-colors hover:bg-white/80 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 no-underline"
        >
          Start free trial
        </Link>
      </main>
      {/* </WavyBackground> */}
    </div>
  )
}


