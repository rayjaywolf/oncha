"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  Clock,
  Zap,
  Repeat,
  AlertTriangle,
  Star,
  ExternalLink,
} from "lucide-react";

interface MarketData {
  btcPrice: number;
  ethPrice: number;
  fearGreedIndex: number;
  totalMarketCap: string;
  volume24h: string;
  defiTvl: string;
  activeTokens: number;
}

interface TrendingToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  sentiment: "bullish" | "bearish" | "neutral";
  source: string;
}

interface MarketDashboardProps {
  className?: string;
}

export default function MarketDashboard({
  className = "",
}: MarketDashboardProps) {
  const [marketData, setMarketData] = useState<MarketData>({
    btcPrice: 43250,
    ethPrice: 2650,
    fearGreedIndex: 68,
    totalMarketCap: "1.65T",
    volume24h: "45B",
    defiTvl: "45.2B",
    activeTokens: 2847,
  });

  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([
    {
      symbol: "SOL",
      name: "Solana",
      price: 98.45,
      change24h: 12.4,
      volume: "2.1B",
      marketCap: "42.8B",
    },
    {
      symbol: "MATIC",
      name: "Polygon",
      price: 0.87,
      change24h: -3.2,
      volume: "345M",
      marketCap: "8.1B",
    },
    {
      symbol: "AVAX",
      name: "Avalanche",
      price: 36.12,
      change24h: 8.7,
      volume: "890M",
      marketCap: "14.2B",
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      price: 14.82,
      change24h: 5.3,
      volume: "456M",
      marketCap: "8.7B",
    },
  ]);

  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: "1",
      title: "Bitcoin ETF Sees Record Inflows",
      summary:
        "Institutional adoption continues to drive positive sentiment...",
      timestamp: "2 hours ago",
      sentiment: "bullish",
      source: "CoinDesk",
    },
    {
      id: "2",
      title: "DeFi TVL Reaches New All-Time High",
      summary: "Total value locked in DeFi protocols surpasses $45B...",
      timestamp: "4 hours ago",
      sentiment: "bullish",
      source: "DeFi Pulse",
    },
    {
      id: "3",
      title: "Regulatory Clarity Expected This Quarter",
      summary:
        "Multiple countries working on comprehensive crypto frameworks...",
      timestamp: "6 hours ago",
      sentiment: "neutral",
      source: "Reuters",
    },
    {
      id: "4",
      title: "Major Exchange Reports Security Upgrade",
      summary: "Enhanced security measures implemented across all platforms...",
      timestamp: "8 hours ago",
      sentiment: "neutral",
      source: "CryptoNews",
    },
  ]);

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData((prev) => ({
        ...prev,
        btcPrice: prev.btcPrice + (Math.random() - 0.5) * 100,
        ethPrice: prev.ethPrice + (Math.random() - 0.5) * 50,
        fearGreedIndex: Math.max(
          0,
          Math.min(100, prev.fearGreedIndex + (Math.random() - 0.5) * 2)
        ),
      }));

      setTrendingTokens((prev) =>
        prev.map((token) => ({
          ...token,
          price: token.price + (Math.random() - 0.5) * (token.price * 0.02),
          change24h: token.change24h + (Math.random() - 0.5) * 2,
        }))
      );

      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getFearGreedColor = (index: number) => {
    if (index >= 75) return "text-green-400";
    if (index >= 50) return "text-yellow-400";
    if (index >= 25) return "text-orange-400";
    return "text-red-400";
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-400 bg-green-400/10";
      case "bearish":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          Market Dashboard
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
          >
            <Repeat
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Bitcoin</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${marketData.btcPrice.toLocaleString()}
          </div>
          <div className="text-sm text-green-400">+2.4% (24h)</div>
        </div>

        <div className="card-base p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Ethereum</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${marketData.ethPrice.toLocaleString()}
          </div>
          <div className="text-sm text-green-400">+1.8% (24h)</div>
        </div>

        <div className="card-base p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Fear & Greed</span>
            <AlertTriangle
              className={`w-4 h-4 ${getFearGreedColor(
                marketData.fearGreedIndex
              )}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white">
              {Math.round(marketData.fearGreedIndex)}
            </div>
            <div className="flex-1">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${marketData.fearGreedIndex}%` }}
                />
              </div>
            </div>
          </div>
          <div
            className={`text-sm ${getFearGreedColor(
              marketData.fearGreedIndex
            )}`}
          >
            {marketData.fearGreedIndex >= 75
              ? "Extreme Greed"
              : marketData.fearGreedIndex >= 50
              ? "Greed"
              : marketData.fearGreedIndex >= 25
              ? "Fear"
              : "Extreme Fear"}
          </div>
        </div>

        <div className="card-base p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Market Cap</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${marketData.totalMarketCap}
          </div>
          <div className="text-sm text-gray-400">Total crypto market</div>
        </div>
      </div>

      {/* Market Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base p-4 text-center">
          <div className="text-lg font-semibold text-blue-400">24h Volume</div>
          <div className="text-2xl font-bold text-white">
            ${marketData.volume24h}
          </div>
        </div>
        <div className="card-base p-4 text-center">
          <div className="text-lg font-semibold text-green-400">DeFi TVL</div>
          <div className="text-2xl font-bold text-white">
            ${marketData.defiTvl}
          </div>
        </div>
        <div className="card-base p-4 text-center">
          <div className="text-lg font-semibold text-purple-400">
            Active Tokens
          </div>
          <div className="text-2xl font-bold text-white">
            {marketData.activeTokens.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Trending Tokens and News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Tokens */}
        <div className="card-base p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Trending Tokens
          </h3>
          <div className="space-y-3">
            {trendingTokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {token.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-gray-400">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">
                    ${token.price.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs ${
                      token.change24h >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest News */}
        <div className="card-base p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Latest News
          </h3>
          <div className="space-y-4">
            {newsItems.map((news) => (
              <div
                key={news.id}
                className="border-b border-white/10 pb-3 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-white text-sm leading-tight">
                    {news.title}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                      news.sentiment
                    )}`}
                  >
                    {news.sentiment}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{news.summary}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{news.source}</span>
                  <span>{news.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
