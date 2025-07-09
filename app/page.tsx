import Image from "next/image";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { ArrowRight, Cable, ShieldCheck, Zap } from "lucide-react";
import Footer from "@/components/ui/footer";
import Link from "next/link";

const avatars = [
  {
    imageUrl: "https://avatars.githubusercontent.com/u/16860528",
    profileUrl: "https://github.com/dillionverma",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/20110627",
    profileUrl: "https://github.com/tomonarifeehan",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/106103625",
    profileUrl: "https://github.com/BankkRoll",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59228569",
    profileUrl: "https://github.com/safethecode",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59442788",
    profileUrl: "https://github.com/sanjay-mali",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/89768406",
    profileUrl: "https://github.com/itsarghyadas",
  },
];

export default function Home() {
  return (
    <div className="bg-[#01010e]">
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        <div className="absolute flex items-center justify-center top-0 left-0 w-full h-full z-0 opacity-100">
          <Image
            src="/element.avif"
            alt=""
            width={850}
            height={850}
            className="w-full max-w-[850px] h-auto"
          />
        </div>
        <div className="absolute bottom-0 left-0 z-0 opacity-80">
          <Image
            src="/lines.avif"
            alt=""
            width={500}
            height={500}
            className="w-40 sm:w-60 md:w-[500px] h-auto"
          />
        </div>
        <div className="absolute bottom-0 right-0 z-0 opacity-80 scale-x-[-1]">
          <Image
            src="/lines.avif"
            alt=""
            width={500}
            height={500}
            className="w-40 sm:w-60 md:w-[500px] h-auto"
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-8 z-10 -mt-10 md:-mt-20 px-4">
          <div className="group rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4">
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1.5 text-xs sm:text-sm text-white/70">
              ✨ AI-Powered Trading Platform
            </AnimatedShinyText>
          </div>
          <h1 className="text-white text-3xl sm:text-5xl md:text-7xl font-bold text-center">
            Trade Smarter with AI
          </h1>
          <p className="text-white/80 text-base sm:text-lg font-regular max-w-[90vw] sm:max-w-[500px] text-center leading-6">
            Make informed trading decisions with real-time market analysis and
            precise recommendations powered by advanced AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center mt-4 gap-4 w-full max-w-xs sm:max-w-none">
            <Link href="/chat" passHref legacyBehavior>
              <a className="bg-white text-black px-4 py-2 rounded-md font-regular w-full sm:w-auto text-center">
                Get Started
              </a>
            </Link>
            <a
              href="#features"
              className="bg-transparent border border-white text-white px-4 py-2 rounded-md font-regular hover:bg-white/10 transition w-full sm:w-auto text-center"
            >
              See Features
            </a>
          </div>
        </div>
      </div>

      <div
        id="features"
        className="z-9 w-full overflow-hidden flex flex-col justify-center items-center -mt-40 md:-mt-70 pb-10 relative rounded-b-4xl"
      >
        <Image
          src="/hero.png"
          alt=""
          width={4110}
          height={2441}
          className="w-full sm:w-[90%] h-auto z-10"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[95vw] md:max-w-[70%] mx-auto my-10 md:my-20 px-2">
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

      <div className="w-full h-full py-10 md:py-20">
        <h1 className="text-white text-3xl sm:text-5xl font-regular text-center mb-6 md:mb-10">
          Multitude of Tools
        </h1>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4 max-w-[98vw] md:max-w-[75%] mx-auto">
            <div className="h-full w-full border-1 border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col py-4 px-4 md:px-8">
                <h3 className="font-bold mb-4 md:mb-8 text-lg md:text-xl text-blue-300">
                  Predictive Pulse AI
                </h3>
                <h1 className="text-white text-2xl md:text-4xl font-regular mb-2 md:mb-4">
                  Get trading signals and insights with AI-powered chart
                  analysis.
                </h1>
                <button className="bg-white text-black px-2 py-1 rounded-full font-regular w-full md:w-1/4 mt-4 flex items-center justify-center gap-2">
                  Try Now <ArrowRight className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-8">
                  {[
                    {
                      title: "Real-time Analysis",
                      description:
                        "Get instant market insights and trading signals powered by advanced AI algorithms.",
                      icon: <Zap className="w-5 h-5" />,
                    },
                    {
                      title: "Smart Predictions",
                      description:
                        "AI-driven price predictions and trend analysis for informed decision making.",
                      icon: <ShieldCheck className="w-5 h-5" />,
                    },
                    {
                      title: "Risk Management",
                      description:
                        "Advanced risk assessment tools to protect your investments and optimize returns.",
                      icon: <Cable className="w-5 h-5" />,
                    },
                    {
                      title: "Portfolio Tracking",
                      description:
                        "Monitor your investments and track performance with real-time updates.",
                      icon: <ArrowRight className="w-5 h-5" />,
                    },
                  ].map((feature, index) => (
                    <div
                      key={feature.title}
                      className={`flex flex-col border-neutral-800 py-6 relative group/feature ${
                        index % 2 === 0 ? "border-r" : ""
                      } ${index < 2 ? "border-b" : ""}`}
                    >
                      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-800 to-transparent pointer-events-none" />
                      <div className="mb-4 relative z-10 px-6 text-neutral-400">
                        {feature.icon}
                      </div>
                      <div className="text-lg font-bold mb-2 relative z-10 px-6">
                        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
                        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-100 text-sm">
                          {feature.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 max-w-xs relative z-10 px-6">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center items-center p-4">
                <div className="group bg-gradient-to-t from-[#05070a] to-[#0b1a3b] h-40 sm:h-full w-full hover:from-[#05070a] hover:to-[#0b1a3b] relative before:absolute before:inset-0 before:bg-[url('/noise.gif')] before:opacity-5 rounded-2xl border border-white/10"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 max-w-[98vw] md:max-w-[75%] mx-auto">
            <div className="h-full w-full border-1 border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col py-4 px-4 md:px-8">
                <h3 className="font-bold mb-4 md:mb-8 text-lg md:text-xl text-red-300">
                  Aegis Rug-Pull Shield
                </h3>
                <h1 className="text-white text-2xl md:text-4xl font-regular mb-2 md:mb-4">
                  Identify and avoid rug pulls with our advanced early warning
                  system
                </h1>
                <button className="bg-white text-black px-2 py-1 rounded-full font-regular w-full md:w-1/4 mt-4 flex items-center justify-center gap-2">
                  Try Now <ArrowRight className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-8">
                  {[
                    {
                      title: "Early Warning System",
                      description:
                        "Receive alerts before potential rug pulls to protect your investments.",
                      icon: <Zap className="w-5 h-5" />,
                    },
                    {
                      title: "Holder Distribution",
                      description:
                        "Checks for high concentration of supply in a few wallets (potential dump risk).",
                      icon: <ShieldCheck className="w-5 h-5" />,
                    },
                    {
                      title: "Contract Veracity",
                      description:
                        "Is the contract verified? Does it contain malicious functions like a honeypot or blacklisting?",
                      icon: <Cable className="w-5 h-5" />,
                    },
                    {
                      title: "Liquidity Status",
                      description:
                        "Is it locked? Is it burned? What percentage of the supply is in the LP?",
                      icon: <ArrowRight className="w-5 h-5" />,
                    },
                  ].map((feature, index) => (
                    <div
                      key={feature.title}
                      className={`flex flex-col border-neutral-800 py-6 relative group/feature ${
                        index % 2 === 0 ? "border-r" : ""
                      } ${index < 2 ? "border-b" : ""}`}
                    >
                      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-800 to-transparent pointer-events-none" />
                      <div className="mb-4 relative z-10 px-6 text-neutral-400">
                        {feature.icon}
                      </div>
                      <div className="text-lg font-bold mb-2 relative z-10 px-6">
                        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
                        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-100 text-sm">
                          {feature.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 max-w-xs relative z-10 px-6">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center items-center p-4">
                <div className="group bg-gradient-to-t from-[#141414] to-[#2b131e] h-40 sm:h-full w-full hover:from-[#141414] hover:to-[#2b131e] relative before:absolute before:inset-0 before:bg-[url('/noise.gif')] before:opacity-5 rounded-2xl border border-white/10"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 max-w-[98vw] md:max-w-[75%] mx-auto">
            <div className="h-full w-full border-1 border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col py-4 px-4 md:px-8">
                <h3 className="font-bold mb-4 md:mb-8 text-lg md:text-xl text-emerald-300">
                  The Vault
                </h3>
                <h1 className="text-white text-2xl md:text-4xl font-regular mb-2 md:mb-4">
                  Track your portfolio and get detailed insights on your
                  investments
                </h1>
                <button className="bg-white text-black px-2 py-1 rounded-full font-regular w-full md:w-1/4 mt-4 flex items-center justify-center gap-2">
                  Try Now <ArrowRight className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-8">
                  {[
                    {
                      title: "Unified Dashboard",
                      description:
                        "See your total portfolio value, 24-hour profit & loss (PnL), and historical performance.",
                      icon: <Zap className="w-5 h-5" />,
                    },
                    {
                      title: "Token Breakdown",
                      description:
                        "Detailed breakdowns of your tokens, including quantity, average cost, and current market value.",
                      icon: <ShieldCheck className="w-5 h-5" />,
                    },
                    {
                      title: "PnL Tracking",
                      description:
                        "Profit and loss tracking for each token in your portfolio.",
                      icon: <ArrowRight className="w-5 h-5" />,
                    },
                    {
                      title: "AI Insights",
                      description:
                        "Get AI-powered insights on your portfolio, including risk analysis and potential opportunities.",
                      icon: <Cable className="w-5 h-5" />,
                    },
                  ].map((feature, index) => (
                    <div
                      key={feature.title}
                      className={`flex flex-col border-neutral-800 py-6 relative group/feature ${
                        index % 2 === 0 ? "border-r" : ""
                      } ${index < 2 ? "border-b" : ""}`}
                    >
                      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-800 to-transparent pointer-events-none" />
                      <div className="mb-4 relative z-10 px-6 text-neutral-400">
                        {feature.icon}
                      </div>
                      <div className="text-lg font-bold mb-2 relative z-10 px-6">
                        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
                        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-100 text-sm">
                          {feature.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 max-w-xs relative z-10 px-6">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center items-center p-4">
                <div className="group bg-gradient-to-t from-[#080808] to-emerald-900 h-40 sm:h-full w-full hover:from-[#080808] hover:to-emerald-900 relative before:absolute before:inset-0 before:bg-[url('/noise.gif')] before:opacity-5 rounded-2xl border border-white/10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-full pb-10 md:pb-20 max-w-[98vw] md:max-w-[75%] mx-auto">
        <h1 className="text-3xl md:text-5xl text-center mb-6 md:mb-10">
          How it works
        </h1>
        <HeroVideoDialog
          className="block dark:hidden w-full max-w-full aspect-video"
          animationStyle="from-center"
          videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
          thumbnailAlt="Hero Video"
        />
      </div>

      <div className="h-full max-w-[98vw] md:max-w-[75%] mx-auto pb-10">
        <div className="h-full rounded-xl bg-gradient-to-br from-blue-900 to-blue-300 flex flex-col items-center justify-center gap-6 py-10 md:py-16 relative overflow-hidden px-2">
          <h1 className="text-2xl md:text-4xl font-regular text-white z-10">
            Join Our Community
          </h1>
          <p className="text-white/80 text-sm md:text-md font-regular text-center max-w-[90vw] md:max-w-[400px] z-10">
            Join our social media channels to stay updated with the latest news,
            updates, and community discussions.
          </p>
          <AvatarCircles numPeople={99} avatarUrls={avatars} className="z-10" />
          <div className="flex flex-col sm:flex-row items-center mt-4 gap-2 z-10 w-full max-w-xs sm:max-w-none">
            <button className="bg-white text-black px-4 py-2 rounded-full font-regular flex items-center gap-2 w-full sm:w-auto">
              Telegram <ArrowRight className="inline w-4 h-4" />
            </button>
            <button className="bg-transparent border border-white text-white px-4 py-2 rounded-full font-regular flex items-center gap-2 hover:bg-white/10 transition w-full sm:w-auto">
              Twitter <ArrowRight className="inline w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
