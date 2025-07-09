import React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#01010e]/60 backdrop-blur-md border-t border-white/10">
      <div className="max-w-full md:max-w-[75%] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <span className="text-xl font-bold text-white tracking-tight">
              ONCH<span className="text-blue-300">AI</span>N
            </span>
            <p className="text-white/70 text-xs sm:text-sm">
              AI-powered trading platform for making informed decisions with
              real-time market analysis.
            </p>
            <div className="flex gap-4 mt-2">
              <Link
                href="#"
                className="text-white/70 hover:text-white transition"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-white/70 hover:text-white transition"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Grid for links: Products, Resources, Company */}
          <div className="col-span-1 md:col-span-3">
            <div className="grid grid-cols-3 gap-4">
              {/* Products */}
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-white mb-1 text-xs sm:text-sm">
                  Products
                </h3>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  Predictive Pulse AI
                </Link>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  Aegis Rug-Pull Shield
                </Link>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  The Vault
                </Link>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  Trading Signals
                </Link>
              </div>
              {/* Resources */}
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-white mb-1 text-xs sm:text-sm">
                  Resources
                </h3>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  Documentation
                </Link>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  API Reference
                </Link>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  Tutorials
                </Link>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  Blog
                </Link>
              </div>
              {/* Company */}
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-white mb-1 text-xs sm:text-sm">
                  Company
                </h3>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  About Us
                </Link>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  Careers
                </Link>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#"
                  className="text-white/70 hover:text-white transition text-xs sm:text-sm"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-xs sm:text-sm text-center md:text-left">
            © {new Date().getFullYear()} ONCHAIN. All rights reserved.
          </p>
          <div className="flex gap-4 mt-2 md:mt-0 justify-center">
            <Link
              href="#"
              className="text-white/50 hover:text-white/70 transition text-xs sm:text-sm"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-white/50 hover:text-white/70 transition text-xs sm:text-sm"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-white/50 hover:text-white/70 transition text-xs sm:text-sm"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
