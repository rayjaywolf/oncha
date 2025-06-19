import React from "react";

export default function Header() {
  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[60%] mx-auto z-50 bg-[#fff]/5 backdrop-blur-md border border-white/10 rounded-2xl">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <span className="text-MD font-bold text-white tracking-tight">
            ONCH<span className="text-blue-300">AI</span>N
          </span>
          <nav className="flex-1 flex justify-center gap-4 text-sm">
            <a
              href="#"
              className="text-white/80 hover:text-white transition font-medium"
            >
              Chat
            </a>
            <a
              href="#"
              className="text-white/80 hover:text-white transition font-medium"
            >
              Trending
            </a>
            <a
              href="#"
              className="text-white/80 hover:text-white transition font-medium"
            >
              Roadmap
            </a>
            <a
              href="#"
              className="text-white/80 hover:text-white transition font-medium"
            >
              Docs
            </a>
          </nav>
        </div>
        {/* Sign In Button */}
        <div className="flex items-center gap-4">
          <button className="bg-white/10 text-white px-4 py-1 rounded-full font-medium hover:bg-white/15 transition text-sm">
            Sign In
          </button>
          <button className="bg-white text-black px-4 py-1 rounded-full font-medium hover:bg-white/15 transition text-sm">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
