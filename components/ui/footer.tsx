import React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#01010e]/60 backdrop-blur-md border-t border-white/10">
      <div className="max-w-[75%] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <span className="text-xl font-bold text-white tracking-tight">
              ONCH<span className="text-blue-300">AI</span>N
            </span>
            <p className="text-white/70 text-sm">
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

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white mb-2 text-right">Products</h3>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              Predictive Pulse AI
            </Link>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              Aegis Rug-Pull Shield
            </Link>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              The Vault
            </Link>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              Trading Signals
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white mb-2 text-right">Resources</h3>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              Documentation
            </Link>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              API Reference
            </Link>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              Tutorials
            </Link>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              Blog
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white mb-2 text-right">Company</h3>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              About Us
            </Link>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              Careers
            </Link>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition text-sm text-right"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} ONCHAIN. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-white/50 hover:text-white/70 transition text-sm"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-white/50 hover:text-white/70 transition text-sm"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-white/50 hover:text-white/70 transition text-sm"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
