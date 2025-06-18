import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 md:p-20 bg-[#151517]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center pt-10">
        <div
          className={cn(
            "absolute inset-0 opacity-25 z-0",
            "[background-size:20px_20px]",
            "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
            "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
          )}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,white)] bg-[#151517]"></div>
        <h1 className="text-4xl md:text-[100px] font-light z-10">
          Trade Smarter with AI
        </h1>
        <p className="text-lg md:text-lg text-center max-w-[600px] text-foreground font-light z-10">
          Make informed trading decisions with real-time market analysis and
          precise recommendations powered by advanced AI.
        </p>
        <div className="flex items-center gap-4 mt-4 z-10">
          <button className="mt-s6 px-6 py-2 rounded-full bg-[#eef35f] text-black font-regular text-md transition-colors hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CBFB44]">
            Get Started
          </button>
          <button className="mt-s6 px-6 py-2 rounded-full bg-[#fff]/10 text-white font-regular text-md transition-colors hover:bg-[#fff]/15 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f1f1f1]">
            See Features
          </button>
        </div>
      </main>
    </div>
  );
}
