import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-8 md:px-50 bg-black text-white">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-10">
        <div className="font-bold text-xl tracking-tight text-[#CBFB44] select-none">
          OnChain
        </div>
        <nav className="hidden md:flex gap-8 text-md font-medium">
          <Link
            href="#"
            className="hover:text-[#CBFB44] text-white transition-colors"
          >
            Chat
          </Link>
          <Link
            href="#"
            className="hover:text-[#CBFB44] text-white transition-colors"
          >
            Trending
          </Link>
          <Link
            href="#"
            className="hover:text-[#CBFB44] text-white transition-colors"
          >
            Docs
          </Link>
          <Link
            href="#"
            className="hover:text-[#CBFB44] text-white transition-colors"
          >
            Roadmap
          </Link>
        </nav>
      </div>
      {/* Right: Sign In Button */}
      <div>
        <button className="px-4 py-1 rounded-full bg-[#CBFB44] text-black font-semibold text-md transition-colors hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CBFB44]">
          Sign In
        </button>
      </div>
    </header>
  );
}
