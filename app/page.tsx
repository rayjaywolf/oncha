"use client";

import Image from "next/image";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import {
  ArrowRight,
  Cable,
  ShieldCheck,
  Zap,
  Bell,
  Star,
  TrendingUp,
  Activity,
  Users,
  Eye,
} from "lucide-react";
import Footer from "@/components/ui/footer";
import Link from "next/link";
import { useState, useEffect } from "react";

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

// Real-time stats component
function LiveStats() {
  const [stats, setStats] = useState({
    activeUsers: 2847,
    totalVolume: 12.4,
    successRate: 84.3,
    alertsSent: 15627,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        totalVolume: prev.totalVolume + (Math.random() * 0.5 - 0.25),
        successRate: prev.successRate + (Math.random() * 0.2 - 0.1),
        alertsSent: prev.alertsSent + Math.floor(Math.random() * 3),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8 px-4 sm:px-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-xs text-white/70">Active Users</span>
        </div>
        <div className="text-lg font-bold text-white transition-all duration-500">
          {stats.activeUsers.toLocaleString()}
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-blue-400 animate-bounce" />
          <span className="text-xs text-white/70">24h Volume</span>
        </div>
        <div className="text-lg font-bold text-white transition-all duration-500">
          ${stats.totalVolume.toFixed(1)}M
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-xs text-white/70">Success Rate</span>
        </div>
        <div className="text-lg font-bold text-white transition-all duration-500">
          {stats.successRate.toFixed(1)}%
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-xs text-white/70">Alerts Sent</span>
        </div>
        <div className="text-lg font-bold text-white transition-all duration-500">
          {stats.alertsSent.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Simulate real-time notifications
    const notifications = [
      "🚨 BTC breaking resistance at $45,000",
      "📈 SOL showing strong bullish momentum",
      "⚠️ High volatility detected in ETH",
      "🎯 New trading opportunity: AVAX/USDT",
      "🔥 Whale activity detected in MATIC",
      "💎 AI detected strong buy signal for DOT",
      "⚡ Flash crash protection activated",
      "🌟 New high-profit opportunity found",
    ];

    let index = 0;
    const interval = setInterval(() => {
      setNotification(notifications[index]);
      index = (index + 1) % notifications.length;

      setTimeout(() => setNotification(null), 4000);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#01010e] relative">
      {/* Real-time notification bar */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5 duration-500">
          <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/20 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              <span className="text-sm font-medium">{notification}</span>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Enhanced background elements */}
        <div className="absolute flex items-center justify-center top-0 left-0 w-full h-full z-0 opacity-100">
          <Image
            src="/element.avif"
            alt=""
            width={850}
            height={850}
            className="w-full max-w-[850px] h-auto animate-pulse-slow"
          />
        </div>
        <div className="absolute bottom-0 left-0 z-0 opacity-80">
          <Image
            src="/lines.avif"
            alt=""
            width={500}
            height={500}
            className="w-40 sm:w-60 md:w-[500px] h-auto animate-float"
          />
        </div>
        <div className="absolute bottom-0 right-0 z-0 opacity-80 scale-x-[-1]">
          <Image
            src="/lines.avif"
            alt=""
            width={500}
            height={500}
            className="w-40 sm:w-60 md:w-[500px] h-auto animate-float-delayed"
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-8 z-10 -mt-10 md:-mt-20 px-4">
          <div className="group rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1.5 text-xs sm:text-sm text-white/70 group-hover:text-white/90 transition-all duration-300">
              ✨ AI-Powered Trading Platform - Live Now
            </AnimatedShinyText>
          </div>

          <h1 className="text-white text-3xl sm:text-5xl md:text-7xl font-bold text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
            Trade Smarter with AI
          </h1>

          <p className="text-white/80 text-base sm:text-lg font-regular max-w-[90vw] sm:max-w-[600px] text-center leading-6 animate-in fade-in-0 slide-in-from-bottom-6 duration-1000 delay-200">
            Make informed trading decisions with real-time market analysis,
            AI-powered price predictions, and comprehensive risk assessment.
            Join thousands of successful traders already using Oncha.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center mt-4 gap-4 w-full max-w-xs sm:max-w-none animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-400">
            <Link
              href="/chat"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto text-center group"
            >
              <span className="flex items-center justify-center gap-2">
                Start Trading Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/vault"
              className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-center group"
            >
              <span className="flex items-center justify-center gap-2">
                Track Portfolio
                <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Live Stats */}
          <LiveStats />
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div
        id="features"
        className="z-9 w-full overflow-hidden flex flex-col justify-center items-center -mt-40 md:-mt-70 pb-10 relative rounded-b-4xl"
      >
        <div className="relative group">
          <Image
            src="/hero.png"
            alt="Oncha Trading Platform"
            width={4110}
            height={2441}
            className="w-full sm:w-[90%] h-auto z-10 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[95vw] md:max-w-[70%] mx-auto my-10 md:my-20 px-2">
          <div className="p-6 flex flex-col gap-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 group">
            <h3 className="flex gap-2 text-white text-lg font-bold items-center">
              <Zap className="w-5 h-5 text-yellow-400 group-hover:animate-pulse" />{" "}
              Real-Time Analysis
            </h3>
            <p className="text-white/80 text-sm font-regular">
              Get instant market insights and AI-powered trading signals with
              our advanced analysis engine that processes thousands of data
              points per second.
            </p>
          </div>
          <div className="p-6 flex flex-col gap-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 group">
            <h3 className="flex gap-2 text-white text-lg font-bold items-center">
              <ShieldCheck className="w-5 h-5 text-green-400 group-hover:animate-pulse" />{" "}
              Rug Pull Protection
            </h3>
            <p className="text-white/80 text-sm font-regular">
              Advanced early warning system that analyzes smart contracts,
              holder distribution, and liquidity to protect your investments
              from scams.
            </p>
          </div>
          <div className="p-6 flex flex-col gap-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 group">
            <h3 className="flex gap-2 text-white text-lg font-bold items-center">
              <Cable className="w-5 h-5 text-blue-400 group-hover:animate-pulse" />{" "}
              Portfolio Tracking
            </h3>
            <p className="text-white/80 text-sm font-regular">
              Track your investments across multiple blockchains with detailed
              P&L analysis, performance metrics, and automated reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Tools Section */}
      <div className="w-full h-full py-10 md:py-20">
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl sm:text-5xl font-regular mb-4">
            Professional Trading Tools
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Everything you need to make informed trading decisions in one
            powerful platform
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4 max-w-[98vw] md:max-w-[75%] mx-auto">
            <div className="h-full w-full border-1 border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
              <div className="flex flex-col py-8 px-8">
                <h3 className="font-bold mb-8 text-xl text-blue-300">
                  Predictive Pulse AI
                </h3>
                <h1 className="text-white text-2xl md:text-4xl font-regular mb-4">
                  Advanced AI-powered trading signals with real-time market
                  analysis and sentiment tracking.
                </h1>
                <Link
                  href="/chat"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold w-fit mt-4 flex items-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Launch AI Assistant <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-8">
                  {[
                    {
                      title: "Smart Predictions",
                      description:
                        "AI-driven price predictions with 85%+ accuracy rate based on advanced machine learning models.",
                      icon: <TrendingUp className="w-5 h-5" />,
                    },
                    {
                      title: "Risk Management",
                      description:
                        "Automated stop-loss and take-profit calculations with position sizing recommendations.",
                      icon: <ShieldCheck className="w-5 h-5" />,
                    },
                    {
                      title: "Multi-Chain Support",
                      description:
                        "Analyze tokens across Ethereum, Solana, BSC, and other major blockchain networks.",
                      icon: <Cable className="w-5 h-5" />,
                    },
                    {
                      title: "Real-Time Alerts",
                      description:
                        "Instant notifications for price movements, volume spikes, and trading opportunities.",
                      icon: <Bell className="w-5 h-5" />,
                    },
                  ].map((feature, index) => (
                    <div
                      key={feature.title}
                      className={`flex flex-col border-neutral-800 py-6 relative group/feature transition-all duration-300 hover:bg-white/5 ${
                        index % 2 === 0 ? "border-r" : ""
                      } ${index < 2 ? "border-b" : ""}`}
                    >
                      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none" />
                      <div className="mb-4 relative z-10 px-6 text-blue-400 group-hover/feature:text-blue-300 transition-colors duration-200">
                        {feature.icon}
                      </div>
                      <div className="text-lg font-bold mb-2 relative z-10 px-6">
                        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
                        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-100 text-sm">
                          {feature.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 max-w-xs relative z-10 px-6 group-hover/feature:text-neutral-200 transition-colors duration-200">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center items-center p-4">
                <div className="group bg-gradient-to-t from-[#05070a] to-[#0b1a3b] h-40 sm:h-full w-full hover:from-[#0a0f1a] hover:to-[#1a2a5b] relative before:absolute before:inset-0 before:bg-[url('/noise.gif')] before:opacity-5 rounded-2xl border border-white/10 transition-all duration-500 hover:border-blue-500/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 max-w-[98vw] md:max-w-[75%] mx-auto">
            <div className="h-full w-full border-1 border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
              <div className="flex flex-col py-8 px-8">
                <h3 className="font-bold mb-8 text-xl text-red-300">
                  Aegis Rug-Pull Shield
                </h3>
                <h1 className="text-white text-2xl md:text-4xl font-regular mb-4">
                  Comprehensive security analysis with machine learning-powered
                  scam detection and risk assessment.
                </h1>
                <Link
                  href="/aegis-rug-pull-shield"
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-full font-semibold w-fit mt-4 flex items-center gap-2 hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
                >
                  Scan for Risks <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-8">
                  {[
                    {
                      title: "Smart Contract Analysis",
                      description:
                        "Deep analysis of contract code for hidden functions, backdoors, and malicious patterns.",
                      icon: <Eye className="w-5 h-5" />,
                    },
                    {
                      title: "Holder Distribution",
                      description:
                        "Real-time monitoring of token distribution and whale movement patterns.",
                      icon: <Users className="w-5 h-5" />,
                    },
                    {
                      title: "Liquidity Analysis",
                      description:
                        "Comprehensive liquidity health checks including lock status and burn verification.",
                      icon: <Activity className="w-5 h-5" />,
                    },
                    {
                      title: "Risk Scoring",
                      description:
                        "AI-powered risk assessment with detailed explanations and severity ratings.",
                      icon: <ShieldCheck className="w-5 h-5" />,
                    },
                  ].map((feature, index) => (
                    <div
                      key={feature.title}
                      className={`flex flex-col border-neutral-800 py-6 relative group/feature transition-all duration-300 hover:bg-white/5 ${
                        index % 2 === 0 ? "border-r" : ""
                      } ${index < 2 ? "border-b" : ""}`}
                    >
                      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-red-600/10 to-transparent pointer-events-none" />
                      <div className="mb-4 relative z-10 px-6 text-red-400 group-hover/feature:text-red-300 transition-colors duration-200">
                        {feature.icon}
                      </div>
                      <div className="text-lg font-bold mb-2 relative z-10 px-6">
                        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-red-500 transition-all duration-200 origin-center" />
                        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-100 text-sm">
                          {feature.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 max-w-xs relative z-10 px-6 group-hover/feature:text-neutral-200 transition-colors duration-200">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center items-center p-4">
                <div className="group bg-gradient-to-t from-[#141414] to-[#2b131e] h-40 sm:h-full w-full hover:from-[#1a1a1a] hover:to-[#3b1a2e] relative before:absolute before:inset-0 before:bg-[url('/noise.gif')] before:opacity-5 rounded-2xl border border-white/10 transition-all duration-500 hover:border-red-500/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 max-w-[98vw] md:max-w-[75%] mx-auto">
            <div className="h-full w-full border-1 border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
              <div className="flex flex-col py-8 px-8">
                <h3 className="font-bold mb-8 text-xl text-emerald-300">
                  The Vault
                </h3>
                <h1 className="text-white text-2xl md:text-4xl font-regular mb-4">
                  Advanced portfolio management with cross-chain tracking,
                  automated reporting, and tax optimization.
                </h1>
                <Link
                  href="/vault"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold w-fit mt-4 flex items-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
                >
                  Track Portfolio <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-8">
                  {[
                    {
                      title: "Multi-Chain Tracking",
                      description:
                        "Track your investments across Ethereum, Solana, BSC, and 15+ other blockchains.",
                      icon: <Cable className="w-5 h-5" />,
                    },
                    {
                      title: "Advanced Analytics",
                      description:
                        "Detailed performance metrics, risk analysis, and portfolio optimization suggestions.",
                      icon: <TrendingUp className="w-5 h-5" />,
                    },
                    {
                      title: "Tax Reporting",
                      description:
                        "Automated tax calculations with support for multiple jurisdictions and export formats.",
                      icon: <Activity className="w-5 h-5" />,
                    },
                    {
                      title: "Smart Alerts",
                      description:
                        "Custom notifications for price targets, portfolio changes, and rebalancing opportunities.",
                      icon: <Bell className="w-5 h-5" />,
                    },
                  ].map((feature, index) => (
                    <div
                      key={feature.title}
                      className={`flex flex-col border-neutral-800 py-6 relative group/feature transition-all duration-300 hover:bg-white/5 ${
                        index % 2 === 0 ? "border-r" : ""
                      } ${index < 2 ? "border-b" : ""}`}
                    >
                      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-emerald-600/10 to-transparent pointer-events-none" />
                      <div className="mb-4 relative z-10 px-6 text-emerald-400 group-hover/feature:text-emerald-300 transition-colors duration-200">
                        {feature.icon}
                      </div>
                      <div className="text-lg font-bold mb-2 relative z-10 px-6">
                        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-emerald-500 transition-all duration-200 origin-center" />
                        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-100 text-sm">
                          {feature.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 max-w-xs relative z-10 px-6 group-hover/feature:text-neutral-200 transition-colors duration-200">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center items-center p-4">
                <div className="group bg-gradient-to-t from-[#080808] to-emerald-900 h-40 sm:h-full w-full hover:from-[#0a0a0a] hover:to-emerald-800 relative before:absolute before:inset-0 before:bg-[url('/noise.gif')] before:opacity-5 rounded-2xl border border-white/10 transition-all duration-500 hover:border-emerald-500/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Video Section */}
      <div className="w-full h-full pb-10 md:pb-20 max-w-[98vw] md:max-w-[75%] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            See Oncha in Action
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Watch how professional traders use Oncha to maximize their profits
            and minimize risks
          </p>
        </div>
        <div className="relative group">
          <HeroVideoDialog
            className="block dark:hidden w-full max-w-full aspect-video rounded-xl overflow-hidden shadow-2xl"
            animationStyle="from-center"
            videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
            thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
            thumbnailAlt="Oncha Platform Demo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
        </div>
      </div>

      {/* Enhanced Community Section */}
      <div className="h-full max-w-[98vw] md:max-w-[75%] mx-auto pb-10">
        <div className="h-full rounded-xl bg-gradient-to-br from-blue-900 via-purple-900 to-blue-300 flex flex-col items-center justify-center gap-8 py-16 relative overflow-hidden px-6">
          <div className="absolute inset-0 bg-[url('/noise.gif')] opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>

          <h1 className="text-2xl md:text-4xl font-bold text-white z-10 text-center">
            Join 25,000+ Successful Traders
          </h1>
          <p className="text-white/90 text-base md:text-lg font-regular text-center max-w-2xl z-10 leading-relaxed">
            Connect with a community of professional traders, share insights,
            get real-time market updates, and access exclusive trading
            strategies.
          </p>

          <div className="flex flex-wrap justify-center gap-4 z-10 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
              <span className="font-bold">15,000+</span> Active Members
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
              <span className="font-bold">500+</span> Signals Daily
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
              <span className="font-bold">85%</span> Success Rate
            </div>
          </div>

          <AvatarCircles
            numPeople={25000}
            avatarUrls={avatars}
            className="z-10"
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 z-10 w-full max-w-md">
            <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-white/30 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Telegram <ArrowRight className="w-4 h-4" />
            </button>
            <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-white/30 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              Twitter <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
