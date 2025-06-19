import Image from "next/image";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { Cable, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-[#01010e]">
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        <div className="absolute flex items-center justify-center top-0 left-0 w-full h-full z-0 opacity-100">
          <Image src="/element.avif" alt="" width={850} height={850} />
        </div>
        <div className="absolute bottom-0 left-0 z-0 opacity-80">
          <Image src="/lines.avif" alt="" width={500} height={500} />
        </div>
        <div className="absolute bottom-0 right-0 z-0 opacity-80 scale-x-[-1]">
          <Image src="/lines.avif" alt="" width={500} height={500} />
        </div>
        <div className="flex flex-col items-center justify-center gap-8 z-10 -mt-20">
          <div className="group rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4">
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1.5 text-sm text-white/70">
              ✨ AI-Powered Trading Platform
            </AnimatedShinyText>
          </div>
          <h1 className="text-white text-7xl font-bold">
            Trade Smarter with AI
          </h1>
          <p className="text-white/80 text-lg font-regular max-w-[500px] text-center leading-6">
            Make informed trading decisions with real-time market analysis and
            precise recommendations powered by advanced AI.
          </p>
          <div className="flex items-center mt-4 gap-4">
            <button className="bg-white text-black px-4 py-2 rounded-md font-regular">
              Get Started
            </button>
            <button className="bg-transparent border border-white text-white px-4 py-2 rounded-md font-regular hover:bg-white/10 transition">
              See Features
            </button>
          </div>
        </div>
      </div>
      <div className="z-10 w-full overflow-hidden flex flex-col justify-center items-center -mt-70 pb-10 relative">
        <Image
          src="/hero.png"
          alt=""
          width={4110}
          height={2441}
          className="w-[90%] h-auto z-10"
        />
        <div className="grid grid-cols-3 gap-4 max-w-[70%] mx-auto my-20">
          <div className="p-4 flex flex-col gap-2">
            <h3 className="flex gap-2 text-white text-md font-bold items-center">
              <Zap className="w-4 h-4" /> Hardware Free
            </h3>
            <p className="text-white/80 text-sm font-regular">
              Eliminate challenging deployments and resource intensive
              maintenance with software-based ZTNA.
            </p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <h3 className="flex gap-2 text-white text-md font-bold items-center">
              <ShieldCheck className="w-4 h-4" /> Zero trust security
            </h3>
            <p className="text-white/80 text-sm font-regular">
              Prevent lateral network traffic, eliminate open inbound ports, and
              implement the principle of least privilege across your entire
              network.
            </p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <h3 className="flex gap-2 text-white text-md font-bold items-center">
              <Cable className="w-4 h-4" /> Performant & productive
            </h3>
            <p className="text-white/80 text-sm font-regular">
              Reduce IT support tickets and improve productivity for end users
              with best-in-class speed, reliability, and user experience.
            </p>
          </div>
        </div>
      </div>

      {/* <section className="grid md:grid-cols-3 gap-6 max-w-[70%] max-md:max-w-xs mx-auto px-4 pb-10 ">
        <div className="group bg-gradient-to-t from-[#242424] to-[#020202] h-80 hover:from-[#182135] hover:to-[#080808] relative before:absolute before:inset-0 before:bg-[url('/noise.gif')] before:opacity-5 rounded-2xl border border-white/10">
          <div className="relative p-6">
            <div className="group-hover:bg-blue-400 bg-white  w-fit px-3 rounded-full text-sm py-1 text-black group-hover:text-white mb-3">
              Market Analysis
            </div>
            <span className="text-lg group-hover:hidden inline-block font-semibold pt-2 text-slate-200 mb-3 ">
              Real-time Analytics
            </span>
            <span className="text-lg group-hover:inline-block hidden font-semibold pt-2 text-slate-200 mb-3 ">
              Market Insights
            </span>
            <p className="text-sm text-slate-500">
              Get real-time market analysis and insights powered by advanced AI
              algorithms to make informed trading decisions.
            </p>
          </div>
        </div>
        <div className="group bg-gradient-to-t from-[#050a0a] to-[#051818] hover:from-[#05070a] hover:to-[#0b1a3b] relative before:absolute before:inset-0 before:bg-[url('/noise.gif')] before:opacity-5 rounded-2xl border border-white/10">
          <div className="relative p-6">
            <div className="bg-green-400 group-hover:bg-blue-600  w-fit px-3 rounded-full text-sm py-1 text-white mb-3">
              Security
            </div>
            <span className="text-lg group-hover:hidden inline-block font-semibold pt-2 text-slate-200 mb-3 ">
              Enhanced Security
            </span>
            <span className="text-lg group-hover:inline-block hidden font-semibold pt-2 text-slate-200 mb-3 ">
              Advanced Protection
            </span>
            <p className="text-sm text-slate-500">
              State-of-the-art security measures to protect your assets and
              trading activities with multi-factor authentication.
            </p>
          </div>
        </div>
        <div className="group bg-gradient-to-t from-[#171c35] to-[#000000] hover:from-[#2b131e] hover:to-[#141414] relative before:absolute before:inset-0 before:bg-[url('/noise.gif')] before:opacity-5 rounded-2xl border border-white/10">
          <div className="relative p-6">
            <div className="bg-blue-400 group-hover:bg-red-500  w-fit px-3 rounded-full text-sm py-1 text-white mb-3">
              AI Trading
            </div>
            <span className="text-lg group-hover:hidden inline-block font-semibold pt-2 text-slate-200 mb-3 ">
              Smart Trading
            </span>
            <span className="text-lg group-hover:inline-block hidden font-semibold pt-2 text-slate-200 mb-3 ">
              AI-Powered Trades
            </span>
            <p className="text-sm text-slate-500">
              Let AI assist your trading decisions with advanced pattern
              recognition and market trend analysis.
            </p>
          </div>
        </div>
      </section> */}
    </div>
  );
}
