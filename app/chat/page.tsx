import React from "react";
import {
  PlusCircle,
  Image,
  Mic,
  Send,
  ThumbsUp,
  ThumbsDown,
  Grid3x3,
  Wind,
  ArrowUpRight,
} from "lucide-react";

export default function App() {
  return <ChatPage />;
}

const ChatPage = () => {
  return (
    <div className="bg-[#01010e] min-h-screen w-full flex flex-col font-sans text-gray-300">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 mt-20">
        <div className="bg-white p-3 rounded-xl shadow-lg mb-6">
          <Wind className="text-[#121212] h-8 w-8" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-3">
          Welcome to Predictive Pulse
        </h2>
        <p className="max-w-md text-gray-400">
          I analyze chart patterns and market data to spot trading signals. Drop
          a coin ticker or upload a chart for detailed insights.
        </p>
      </main>

      <footer className="w-full flex flex-col items-center p-4 pb-6">
        <div className="w-full max-w-3xl">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-3">
              <button className="text-gray-400 hover:text-white">
                <PlusCircle className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-white">
                <Image className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-white">
                <Mic className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Ask me anything..."
              className="w-full bg-[#282828] border border-gray-700 rounded-full py-4 pl-28 pr-48 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-3">
              <button className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-full text-white hover:opacity-90 transition-opacity flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Predictive Pulse AI may contain errors. We recommend checking
          important information.
        </p>
      </footer>
    </div>
  );
};
