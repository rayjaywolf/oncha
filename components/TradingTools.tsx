"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Bell,
  Plus,
  X,
  Activity,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
} from "lucide-react";

interface TradingToolsProps {
  className?: string;
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: "buy" | "sell" | "neutral";
  confidence: number;
  description: string;
}

interface PriceAlert {
  id: string;
  symbol: string;
  type: "above" | "below";
  price: number;
  currentPrice: number;
  isActive: boolean;
}

interface AISignal {
  symbol: string;
  direction: "long" | "short";
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
}

export default function TradingTools({ className = "" }: TradingToolsProps) {
  const [technicalIndicators, setTechnicalIndicators] = useState<
    TechnicalIndicator[]
  >([
    {
      name: "RSI (14)",
      value: 65.4,
      signal: "neutral",
      confidence: 75,
      description: "Relative Strength Index indicates neutral momentum",
    },
    {
      name: "MACD",
      value: 1.2,
      signal: "buy",
      confidence: 85,
      description: "MACD crossover suggests bullish momentum",
    },
    {
      name: "Moving Average (50)",
      value: 42100,
      signal: "buy",
      confidence: 70,
      description: "Price above MA50 indicates upward trend",
    },
    {
      name: "Bollinger Bands",
      value: 0.78,
      signal: "neutral",
      confidence: 60,
      description: "Price in middle of Bollinger Band range",
    },
    {
      name: "Volume Profile",
      value: 125,
      signal: "buy",
      confidence: 80,
      description: "High volume support at current levels",
    },
  ]);

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([
    {
      id: "1",
      symbol: "BTC",
      type: "above",
      price: 45000,
      currentPrice: 43250,
      isActive: true,
    },
    {
      id: "2",
      symbol: "ETH",
      type: "below",
      price: 2500,
      currentPrice: 2650,
      isActive: true,
    },
  ]);

  const [aiSignals, setAiSignals] = useState<AISignal[]>([
    {
      symbol: "SOL",
      direction: "long",
      entryPrice: 98.5,
      targetPrice: 115,
      stopLoss: 92,
      confidence: 82,
      timeframe: "4H",
      reasoning:
        "Strong breakout above resistance with high volume confirmation",
    },
    {
      symbol: "AVAX",
      direction: "long",
      entryPrice: 34.2,
      targetPrice: 42,
      stopLoss: 31,
      confidence: 76,
      timeframe: "1D",
      reasoning: "Bullish divergence in RSI with oversold bounce potential",
    },
  ]);

  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [marketSentiment, setMarketSentiment] = useState({
    overall: "bullish",
    strength: 78,
  });

  const [newAlert, setNewAlert] = useState({
    symbol: "",
    type: "above" as "above" | "below",
    price: "",
  });

  const [showAddAlert, setShowAddAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time indicator updates
      setTechnicalIndicators((prev) =>
        prev.map((indicator) => ({
          ...indicator,
          value:
            indicator.value + (Math.random() - 0.5) * (indicator.value * 0.02),
          confidence: Math.max(
            0,
            Math.min(100, indicator.confidence + (Math.random() - 0.5) * 5)
          ),
        }))
      );

      // Update price alerts with simulated price changes
      setPriceAlerts((prev) =>
        prev.map((alert) => ({
          ...alert,
          currentPrice:
            alert.currentPrice +
            (Math.random() - 0.5) * (alert.currentPrice * 0.01),
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "buy":
        return "text-green-400 bg-green-400/10";
      case "sell":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-400";
    if (confidence >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const addPriceAlert = () => {
    if (newAlert.symbol && newAlert.price) {
      const alert: PriceAlert = {
        id: Date.now().toString(),
        symbol: newAlert.symbol.toUpperCase(),
        type: newAlert.type,
        price: parseFloat(newAlert.price),
        currentPrice: parseFloat(newAlert.price) * (Math.random() * 0.2 + 0.9), // Simulate current price
        isActive: true,
      };
      setPriceAlerts((prev) => [...prev, alert]);
      setNewAlert({ symbol: "", type: "above", price: "" });
      setShowAddAlert(false);
    }
  };

  const removeAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const symbols = ["BTC", "ETH", "SOL", "AVAX", "MATIC", "LINK", "ADA", "DOT"];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Trading Tools</h1>
            <p className="text-gray-400 text-sm">
              Advanced technical analysis and signals
            </p>
          </div>
        </div>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="bg-gray-800/60 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {symbols.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>

      {/* Market Sentiment */}
      <div className="glass-morphism rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Market Sentiment</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Overall Sentiment</span>
              <span
                className={`font-semibold ${
                  marketSentiment.overall === "bullish"
                    ? "text-green-400"
                    : marketSentiment.overall === "bearish"
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {marketSentiment.overall.toUpperCase()}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${marketSentiment.strength}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Bearish</span>
              <span>{marketSentiment.strength}% Strength</span>
              <span>Bullish</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="glass-morphism rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">
            Technical Indicators ({selectedSymbol})
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {technicalIndicators.map((indicator, index) => (
            <div
              key={index}
              className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{indicator.name}</h4>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getSignalColor(
                    indicator.signal
                  )}`}
                >
                  {indicator.signal.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-white">
                  {indicator.name.includes("Price") ||
                  indicator.name.includes("Average")
                    ? `$${indicator.value.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}`
                    : indicator.value.toFixed(2)}
                </span>
                <div className="text-right">
                  <span
                    className={`text-sm font-semibold ${getConfidenceColor(
                      indicator.confidence
                    )}`}
                  >
                    {indicator.confidence}%
                  </span>
                  <p className="text-xs text-gray-400">confidence</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{indicator.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Trading Signals */}
        <div className="glass-morphism rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-semibold">AI Trading Signals</h3>
          </div>
          <div className="space-y-4">
            {aiSignals.map((signal, index) => (
              <div
                key={index}
                className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">
                      {signal.symbol}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        signal.direction === "long"
                          ? "text-green-400 bg-green-400/10"
                          : "text-red-400 bg-red-400/10"
                      }`}
                    >
                      {signal.direction.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm font-semibold ${getConfidenceColor(
                        signal.confidence
                      )}`}
                    >
                      {signal.confidence}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-gray-400 text-xs">Entry</p>
                    <p className="text-white font-medium">
                      ${signal.entryPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Target</p>
                    <p className="text-green-400 font-medium">
                      ${signal.targetPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Stop Loss</p>
                    <p className="text-red-400 font-medium">
                      ${signal.stopLoss}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {signal.timeframe}
                  </span>
                  <span className="text-xs text-gray-400">
                    R/R:{" "}
                    {(
                      (signal.targetPrice - signal.entryPrice) /
                      (signal.entryPrice - signal.stopLoss)
                    ).toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">{signal.reasoning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Price Alerts */}
        <div className="glass-morphism rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Price Alerts</h3>
            </div>
            <button
              onClick={() => setShowAddAlert(true)}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg transition-all duration-300 border border-cyan-500/30"
            >
              <Plus className="w-4 h-4" />
              Add Alert
            </button>
          </div>

          {showAddAlert && (
            <div className="bg-gray-800/40 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Symbol (e.g., BTC)"
                  value={newAlert.symbol}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, symbol: e.target.value })
                  }
                  className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <select
                  value={newAlert.type}
                  onChange={(e) =>
                    setNewAlert({
                      ...newAlert,
                      type: e.target.value as "above" | "below",
                    })
                  }
                  className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={newAlert.price}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, price: e.target.value })
                  }
                  className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addPriceAlert}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all duration-300"
                >
                  <CheckCircle className="w-4 h-4" />
                  Add
                </button>
                <button
                  onClick={() => setShowAddAlert(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {priceAlerts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No active alerts</p>
            ) : (
              priceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          alert.isActive
                            ? "bg-green-400 animate-pulse"
                            : "bg-gray-400"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {alert.symbol}
                          </span>
                          <span
                            className={`text-sm ${
                              alert.type === "above"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {alert.type === "above" ? "↗" : "↘"} ${alert.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>Current: ${alert.currentPrice.toFixed(2)}</span>
                          <span
                            className={`flex items-center gap-1 ${
                              (alert.type === "above" &&
                                alert.currentPrice >= alert.price) ||
                              (alert.type === "below" &&
                                alert.currentPrice <= alert.price)
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }`}
                          >
                            {(alert.type === "above" &&
                              alert.currentPrice >= alert.price) ||
                            (alert.type === "below" &&
                              alert.currentPrice <= alert.price) ? (
                              <>
                                <AlertTriangle className="w-3 h-3" />
                                Triggered
                              </>
                            ) : (
                              "Waiting"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
