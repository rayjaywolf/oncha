import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 md:p-20 bg-[#151517]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-4xl md:text-7xl font-light">
          Trade Smarter with AI
        </h1>
        <p className="text-lg md:text-lg text-center max-w-[600px] text-foreground font-light">
          Make informed trading decisions with real-time market analysis and
          precise recommendations powered by advanced AI.
        </p>
        <button className="mt-6 px-6 py-2 rounded-full bg-[#CBFB44] text-black font-regular text-md transition-colors hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CBFB44]">
          Get Started
        </button>
      </main>
    </div>
  );
}
