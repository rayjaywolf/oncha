"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Menu, Sun, Moon } from "lucide-react";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "dark";
    }
    return "dark";
  });

  // Apply theme to html root
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  }, [theme]);

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[60%] mx-auto z-50 bg-[#fff]/5 backdrop-blur-md border border-white/10 rounded-full">
        <div className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8 ml-3">
            <Link
              href="/"
              className="text-MD font-bold text-white tracking-tight"
            >
              ONCH<span className="text-blue-300">AI</span>N
            </Link>
          </div>
          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-1 justify-center gap-4 text-sm">
            <Link
              href="/chat"
              className="text-white/80 hover:text-white transition font-medium"
            >
              Predictive Pulse
            </Link>
            <a
              href="/aegis-rug-pull-shield"
              className="text-white/80 hover:text-white transition font-medium"
            >
              Aegis Rug-Pull Shield
            </a>
            <a
              href="/vault"
              className="text-white/80 hover:text-white transition font-medium"
            >
              Vault
            </a>
          </nav>
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-white/10 bg-white/10 hover:bg-white/20 transition text-white flex items-center justify-center"
              style={{ minWidth: 36, minHeight: 36 }}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            {/* <button className="bg-white/10 text-white px-4 py-2 rounded-full font-medium hover:bg-white/15 transition text-sm">
              Sign In
            </button> */}
            <Link
              href="/chat"
              className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-white/90 hover:text-black transition text-sm "
            >
              Get Started
            </Link>
          </div>
          {/* Mobile Menu Icon Only */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#fff]/5 border border-white/10 ml-auto"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          {/* Mobile Theme Toggle */}
          <button
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            className="md:hidden ml-2 p-2 rounded-full border border-white/10 bg-white/10 hover:bg-white/20 transition text-white flex items-center justify-center"
            style={{ minWidth: 36, minHeight: 36 }}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed top-0 right-0 h-full w-64 bg-[#10101a] z-50 shadow-lg flex flex-col p-6 transition-transform duration-300 transform translate-x-0"
            style={{ boxShadow: "0 0 40px 0 rgba(0,0,0,0.3)" }}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="self-end mb-6 text-white/70 hover:text-white text-2xl"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
            <nav className="flex flex-col gap-4 text-base">
              <Link
                href="/chat"
                className="text-white/80 hover:text-white transition font-medium"
                onClick={() => setSidebarOpen(false)}
              >
                Predictive Pulse
              </Link>
              <a
                href="/aegis-rug-pull-shield"
                className="text-white/80 hover:text-white transition font-medium"
                onClick={() => setSidebarOpen(false)}
              >
                Aegis Rug-Pull Shield
              </a>
              <a
                href="/vault"
                className="text-white/80 hover:text-white transition font-medium"
                onClick={() => setSidebarOpen(false)}
              >
                Vault
              </a>
              <Link
                href="/chat"
                className="mt-6 bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-white/90 hover:text-black transition text-sm text-center"
                onClick={() => setSidebarOpen(false)}
              >
                Get Started
              </Link>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
