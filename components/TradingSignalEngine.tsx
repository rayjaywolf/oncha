"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  Zap,
  Activity,
  BarChart3,
  Cpu,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Settings,
  RefreshCw,
  Filter,
  Eye,
  Bell,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TradingSignal {
  id: string;
  symbol: string;
  type: "buy" | "sell" | "hold";
  algorithm: string;
  confidence: number;
  strength: "weak" | "moderate" | "strong" | "very_strong";
  timeframe: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskReward: number;
  timestamp: Date;
  status: "active" | "executed" | "expired" | "cancelled";
  metadata: {
    indicators: string[];
    volume: number;
    volatility: number;
    sentiment: number;
    trend: string;
  };
}

interface AlgorithmPerformance {
  name: string;
  accuracy: number;
  profitability: number;
  winRate: number;
  trades: number;
  avgReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  active: boolean;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  signals: number;
  sentiment: number;
  volatility: number;
  trending: boolean;
}

// Mock data generators
const generateTradingSignals = (): TradingSignal[] => [
  {
    id: "1",
    symbol: "BTC",
    type: "buy",
    algorithm: "Neural Network Ensemble",
    confidence: 92,
    strength: "very_strong",
    timeframe: "4h",
    entryPrice: 43250,
    targetPrice: 47800,
    stopLoss: 41200,
    riskReward: 2.2,
    timestamp: new Date(Date.now() - 5 * 60000),
    status: "active",
    metadata: {
      indicators: ["RSI Oversold", "MACD Bullish Cross", "Volume Spike"],
      volume: 1.8,
      volatility: 0.23,
      sentiment: 0.78,
      trend: "bullish",
    },
  },
  {
    id: "2",
    symbol: "ETH",
    type: "sell",
    algorithm: "Deep Learning CNN",
    confidence: 85,
    strength: "strong",
    timeframe: "1h",
    entryPrice: 2650,
    targetPrice: 2480,
    stopLoss: 2720,
    riskReward: 2.4,
    timestamp: new Date(Date.now() - 15 * 60000),
    status: "active",
    metadata: {
      indicators: ["RSI Overbought", "Bearish Divergence", "Resistance Hit"],
      volume: 1.2,
      volatility: 0.18,
      sentiment: 0.34,
      trend: "bearish",
    },
  },
  {
    id: "3",
    symbol: "SOL",
    type: "buy",
    algorithm: "Sentiment Analysis AI",
    confidence: 76,
    strength: "moderate",
    timeframe: "15m",
    entryPrice: 98.45,
    targetPrice: 105.2,
    stopLoss: 94.8,
    riskReward: 1.8,
    timestamp: new Date(Date.now() - 30 * 60000),
    status: "executed",
    metadata: {
      indicators: [
        "Social Buzz Increase",
        "Whale Accumulation",
        "Support Hold",
      ],
      volume: 2.1,
      volatility: 0.31,
      sentiment: 0.82,
      trend: "bullish",
    },
  },
  {
    id: "4",
    symbol: "MATIC",
    type: "hold",
    algorithm: "Multi-Factor Model",
    confidence: 68,
    strength: "weak",
    timeframe: "1d",
    entryPrice: 0.89,
    targetPrice: 0.89,
    stopLoss: 0.82,
    riskReward: 0.0,
    timestamp: new Date(Date.now() - 60 * 60000),
    status: "active",
    metadata: {
      indicators: ["Sideways Movement", "Low Volume", "Neutral Sentiment"],
      volume: 0.8,
      volatility: 0.12,
      sentiment: 0.51,
      trend: "neutral",
    },
  },
];

const generateAlgorithmPerformance = (): AlgorithmPerformance[] => [
  {
    name: "Neural Network Ensemble",
    accuracy: 87.5,
    profitability: 145.2,
    winRate: 72.3,
    trades: 1247,
    avgReturn: 3.8,
    sharpeRatio: 2.1,
    maxDrawdown: -8.5,
    active: true,
  },
  {
    name: "Deep Learning CNN",
    accuracy: 83.2,
    profitability: 132.7,
    winRate: 68.9,
    trades: 986,
    avgReturn: 3.2,
    sharpeRatio: 1.9,
    maxDrawdown: -12.1,
    active: true,
  },
  {
    name: "Sentiment Analysis AI",
    accuracy: 79.8,
    profitability: 118.5,
    winRate: 65.4,
    trades: 2156,
    avgReturn: 2.7,
    sharpeRatio: 1.6,
    maxDrawdown: -15.3,
    active: true,
  },
  {
    name: "Multi-Factor Model",
    accuracy: 74.1,
    profitability: 98.3,
    winRate: 61.2,
    trades: 1834,
    avgReturn: 2.1,
    sharpeRatio: 1.4,
    maxDrawdown: -18.7,
    active: false,
  },
  {
    name: "Technical Pattern Recognition",
    accuracy: 81.5,
    profitability: 125.8,
    winRate: 67.1,
    trades: 1521,
    avgReturn: 2.9,
    sharpeRatio: 1.7,
    maxDrawdown: -11.2,
    active: true,
  },
];

const generateMarketOverview = (): MarketData[] => [
  {
    symbol: "BTC",
    price: 43250,
    change24h: 3.2,
    volume: 28500000000,
    marketCap: 847000000000,
    signals: 3,
    sentiment: 0.78,
    volatility: 0.23,
    trending: true,
  },
  {
    symbol: "ETH",
    price: 2650,
    change24h: -1.8,
    volume: 15200000000,
    marketCap: 318000000000,
    signals: 2,
    sentiment: 0.34,
    volatility: 0.18,
    trending: false,
  },
  {
    symbol: "SOL",
    price: 98.45,
    change24h: 5.7,
    volume: 2800000000,
    marketCap: 42000000000,
    signals: 1,
    sentiment: 0.82,
    volatility: 0.31,
    trending: true,
  },
  {
    symbol: "MATIC",
    price: 0.89,
    change24h: -0.3,
    volume: 890000000,
    marketCap: 8200000000,
    signals: 1,
    sentiment: 0.51,
    volatility: 0.12,
    trending: false,
  },
];

const generatePerformanceChart = () => {
  const data = [];
  let cumulative = 100;

  for (let i = 0; i < 30; i++) {
    const dailyReturn = (Math.random() - 0.45) * 5; // Slight positive bias
    cumulative *= 1 + dailyReturn / 100;

    data.push({
      day: i + 1,
      portfolio: cumulative,
      benchmark: 100 * Math.pow(1.002, i), // 0.2% daily growth
      signals: Math.floor(Math.random() * 15) + 5,
      accuracy: 70 + Math.random() * 20,
    });
  }

  return data;
};

export default function TradingSignalEngine() {
  const [signals, setSignals] = useState<TradingSignal[]>(
    generateTradingSignals()
  );
  const [algorithms] = useState<AlgorithmPerformance[]>(
    generateAlgorithmPerformance()
  );
  const [marketData] = useState<MarketData[]>(generateMarketOverview());
  const [performanceData] = useState(generatePerformanceChart());
  const [isRunning, setIsRunning] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time signal generation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Simulate new signals occasionally
      if (Math.random() < 0.2) {
        const symbols = ["BTC", "ETH", "SOL", "MATIC", "LINK", "AVAX"];
        const types: ("buy" | "sell" | "hold")[] = ["buy", "sell", "hold"];
        const algorithms = [
          "Neural Network Ensemble",
          "Deep Learning CNN",
          "Sentiment Analysis AI",
        ];

        const newSignal: TradingSignal = {
          id: Math.random().toString(36).substr(2, 9),
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          type: types[Math.floor(Math.random() * types.length)],
          algorithm: algorithms[Math.floor(Math.random() * algorithms.length)],
          confidence: Math.floor(Math.random() * 30) + 70,
          strength: ["weak", "moderate", "strong", "very_strong"][
            Math.floor(Math.random() * 4)
          ] as any,
          timeframe: ["5m", "15m", "1h", "4h", "1d"][
            Math.floor(Math.random() * 5)
          ],
          entryPrice: Math.random() * 50000 + 1000,
          targetPrice: 0,
          stopLoss: 0,
          riskReward: Math.random() * 3 + 1,
          timestamp: new Date(),
          status: "active",
          metadata: {
            indicators: ["RSI", "MACD", "Volume"],
            volume: Math.random() * 2 + 0.5,
            volatility: Math.random() * 0.5 + 0.1,
            sentiment: Math.random(),
            trend: ["bullish", "bearish", "neutral"][
              Math.floor(Math.random() * 3)
            ],
          },
        };

        newSignal.targetPrice =
          newSignal.type === "buy"
            ? newSignal.entryPrice * (1 + newSignal.riskReward * 0.02)
            : newSignal.entryPrice * (1 - newSignal.riskReward * 0.02);

        newSignal.stopLoss =
          newSignal.type === "buy"
            ? newSignal.entryPrice * 0.98
            : newSignal.entryPrice * 1.02;

        setSignals((prev) => [newSignal, ...prev.slice(0, 9)]);
      }

      setLastUpdate(new Date());
    }, 15000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const filteredSignals = signals.filter((signal) => {
    const timeframeMatch =
      selectedTimeframe === "all" || signal.timeframe === selectedTimeframe;
    const algorithmMatch =
      selectedAlgorithm === "all" || signal.algorithm === selectedAlgorithm;
    return timeframeMatch && algorithmMatch;
  });

  const getSignalIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowUp className="h-4 w-4 text-green-400" />;
      case "sell":
        return <ArrowDown className="h-4 w-4 text-red-400" />;
      case "hold":
        return <Minus className="h-4 w-4 text-gray-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case "buy":
        return "border-l-green-400 bg-green-400/10";
      case "sell":
        return "border-l-red-400 bg-red-400/10";
      case "hold":
        return "border-l-gray-400 bg-gray-400/10";
      default:
        return "border-l-gray-400 bg-gray-400/10";
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "very_strong":
        return "bg-green-600 text-white";
      case "strong":
        return "bg-green-500 text-white";
      case "moderate":
        return "bg-yellow-500 text-white";
      case "weak":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatCurrency = (value: number) => {
    if (value < 1) return `$${value.toFixed(4)}`;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-400" />
              AI Trading Signal Engine
            </h1>
            <p className="text-gray-400 mt-1">
              Advanced algorithmic trading signals powered by machine learning
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "default" : "outline"}
              className={
                isRunning
                  ? "bg-green-600 hover:bg-green-700"
                  : "border-gray-600 text-gray-300"
              }
            >
              {isRunning ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Running" : "Stopped"}
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Signals</p>
                  <p className="text-2xl font-bold text-white">
                    {signals.filter((s) => s.status === "active").length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-blue-500/20 text-blue-400">
                  {isRunning ? "Live" : "Paused"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Confidence</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(
                      signals.reduce((acc, s) => acc + s.confidence, 0) /
                        signals.length
                    )}
                    %
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-green-500/20 text-green-400">
                  High Quality
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Algorithms Active</p>
                  <p className="text-2xl font-bold text-white">
                    {algorithms.filter((a) => a.active).length}
                  </p>
                </div>
                <Cpu className="h-8 w-8 text-purple-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-purple-500/20 text-purple-400">
                  Multi-Model
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(
                      algorithms.reduce((acc, a) => acc + a.accuracy, 0) /
                        algorithms.length
                    )}
                    %
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-green-500/20 text-green-400">
                  Above Target
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="signals" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="signals" className="text-gray-300">
              <Target className="h-4 w-4 mr-2" />
              Live Signals
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-gray-300">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="algorithms" className="text-gray-300">
              <Brain className="h-4 w-4 mr-2" />
              Algorithms
            </TabsTrigger>
            <TabsTrigger value="market" className="text-gray-300">
              <Activity className="h-4 w-4 mr-2" />
              Market Overview
            </TabsTrigger>
          </TabsList>

          {/* Live Signals */}
          <TabsContent value="signals" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">
                    Live Trading Signals
                  </CardTitle>
                  <div className="flex gap-2">
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    >
                      <option value="all">All Timeframes</option>
                      <option value="5m">5 Minutes</option>
                      <option value="15m">15 Minutes</option>
                      <option value="1h">1 Hour</option>
                      <option value="4h">4 Hours</option>
                      <option value="1d">1 Day</option>
                    </select>
                    <select
                      value={selectedAlgorithm}
                      onChange={(e) => setSelectedAlgorithm(e.target.value)}
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    >
                      <option value="all">All Algorithms</option>
                      {algorithms.map((algo) => (
                        <option key={algo.name} value={algo.name}>
                          {algo.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSignals.map((signal) => (
                    <div
                      key={signal.id}
                      className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:bg-gray-700/30 ${getSignalColor(
                        signal.type
                      )}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getSignalIcon(signal.type)}
                            <h4 className="font-bold text-white text-lg">
                              {signal.symbol}
                            </h4>
                            <Badge
                              className={getStrengthColor(signal.strength)}
                            >
                              {signal.strength.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-gray-300">
                              {signal.timeframe}
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-400">
                              {signal.confidence}% confidence
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <span className="text-gray-400 text-sm">
                                Entry:
                              </span>
                              <div className="text-white font-medium">
                                {formatCurrency(signal.entryPrice)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm">
                                Target:
                              </span>
                              <div className="text-green-400 font-medium">
                                {formatCurrency(signal.targetPrice)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm">
                                Stop Loss:
                              </span>
                              <div className="text-red-400 font-medium">
                                {formatCurrency(signal.stopLoss)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm">
                                R/R Ratio:
                              </span>
                              <div className="text-blue-400 font-medium">
                                {signal.riskReward.toFixed(1)}:1
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                            <span>Algorithm: {signal.algorithm}</span>
                            <span>
                              Volume: {signal.metadata.volume.toFixed(1)}x
                            </span>
                            <span>
                              Volatility:{" "}
                              {(signal.metadata.volatility * 100).toFixed(1)}%
                            </span>
                            <span>
                              Sentiment:{" "}
                              {(signal.metadata.sentiment * 100).toFixed(0)}%
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {signal.metadata.indicators.map(
                              (indicator, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {indicator}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-gray-400">
                            {signal.timestamp.toLocaleTimeString()}
                          </div>
                          <Badge
                            className={
                              signal.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : signal.status === "executed"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-gray-500/20 text-gray-400"
                            }
                          >
                            {signal.status}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-blue-400"
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Strategy Performance (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="portfolio"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="AI Strategy"
                      />
                      <Line
                        type="monotone"
                        dataKey="benchmark"
                        stroke="#6b7280"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Benchmark"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Algorithms */}
          <TabsContent value="algorithms" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Algorithm Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {algorithms.map((algo, index) => (
                    <div key={index} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-white">
                            {algo.name}
                          </h4>
                          <Badge
                            className={
                              algo.active
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                            }
                          >
                            {algo.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            {algo.profitability.toFixed(1)}%
                          </div>
                          <div className="text-gray-400 text-sm">
                            Profitability
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Accuracy</div>
                          <div className="text-white font-medium">
                            {algo.accuracy.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Win Rate</div>
                          <div className="text-white font-medium">
                            {algo.winRate.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Trades</div>
                          <div className="text-white font-medium">
                            {algo.trades.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Avg Return</div>
                          <div className="text-white font-medium">
                            {algo.avgReturn.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Sharpe Ratio</div>
                          <div className="text-white font-medium">
                            {algo.sharpeRatio.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Max Drawdown</div>
                          <div className="text-red-400 font-medium">
                            {algo.maxDrawdown.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Overview */}
          <TabsContent value="market" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Market Signal Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketData.map((asset, index) => (
                    <div key={index} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white text-lg">
                          {asset.symbol}
                        </h4>
                        {asset.trending && (
                          <Star className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price:</span>
                          <span className="text-white font-medium">
                            {formatCurrency(asset.price)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">24h Change:</span>
                          <span
                            className={
                              asset.change24h > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {asset.change24h > 0 ? "+" : ""}
                            {asset.change24h.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Signals:</span>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {asset.signals}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sentiment:</span>
                          <div
                            className={`text-sm font-medium ${
                              asset.sentiment > 0.6
                                ? "text-green-400"
                                : asset.sentiment < 0.4
                                ? "text-red-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {(asset.sentiment * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
