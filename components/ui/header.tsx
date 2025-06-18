import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-8 md:px-50 bg-[#151517]/20 backdrop-blur-md text-white border-b border-[#252525]">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-10">
        <div className="font-bold text-xl tracking-tight text-[#eef35f] select-none">
          OnChain
        </div>
        <nav className="hidden md:flex gap-6 text-md font-medium">
          <Link
            href="#"
            className="hover:text-[#eef35f] text-white transition-colors"
          >
            Chat
          </Link>
          <Link
            href="#"
            className="hover:text-[#eef35f] text-white transition-colors"
          >
            Trending
          </Link>
          <Link
            href="#"
            className="hover:text-[#eef35f] text-white transition-colors"
          >
            Docs
          </Link>
          <Link
            href="#"
            className="hover:text-[#eef35f] text-white transition-colors"
          >
            Roadmap
          </Link>
        </nav>
      </div>
      {/* Right: Sign In Button */}
      <div className="flex items-center gap-4">
        <button className="px-6 py-1 rounded-full bg-[#fff] text-black font-[500] text-md transition-colors hover:bg-[#f1f1f1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f1f1f1]">
          Sign In
        </button>
        <button className="px-6 py-1 rounded-full bg-[#fff]/10 text-white font-[500] text-md transition-colors hover:bg-[#fff]/15 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f1f1f1]">
          Try For Free
        </button>
      </div>
    </header>
  );
}
