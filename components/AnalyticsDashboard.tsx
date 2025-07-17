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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Zap,
  Shield,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Brain,
  Cpu,
  Globe,
  Timer,
} from "lucide-react";

// Mock data generators for realistic analytics
const generatePerformanceData = () => {
  const data = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  for (let i = 0; i < 180; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const baseValue = 10000;
    const growth = Math.pow(1.0008, i); // Slight upward trend
    const volatility = Math.sin(i * 0.1) * 500 + Math.random() * 1000 - 500;

    data.push({
      date: date.toISOString().split("T")[0],
      portfolio: Math.round(baseValue * growth + volatility),
      benchmark: Math.round(baseValue * Math.pow(1.0005, i)),
      profit: Math.round(baseValue * growth + volatility - baseValue),
      trades: Math.floor(Math.random() * 50) + 10,
      winRate: 65 + Math.random() * 20,
    });
  }
  return data;
};

const generateTradingMetrics = () => [
  { name: "Successful Trades", value: 847, trend: 12.5, color: "#10b981" },
  { name: "Failed Trades", value: 153, trend: -8.2, color: "#ef4444" },
  { name: "Total Volume", value: 2450000, trend: 18.7, color: "#3b82f6" },
  { name: "Avg Hold Time", value: 4.2, trend: -5.1, color: "#8b5cf6" },
];

const generatePortfolioAllocation = () => [
  { name: "Bitcoin", value: 35, amount: 87500, color: "#f7931a" },
  { name: "Ethereum", value: 25, amount: 62500, color: "#627eea" },
  { name: "Solana", value: 15, amount: 37500, color: "#9945ff" },
  { name: "Polygon", value: 10, amount: 25000, color: "#8247e5" },
  { name: "Chainlink", value: 8, amount: 20000, color: "#375bd2" },
  { name: "Others", value: 7, amount: 17500, color: "#64748b" },
];

const generateRiskMetrics = () => [
  { metric: "Portfolio Beta", value: 1.23, target: 1.0, status: "warning" },
  { metric: "Sharpe Ratio", value: 2.45, target: 2.0, status: "good" },
  { metric: "Max Drawdown", value: -12.5, target: -15.0, status: "good" },
  { metric: "VaR (95%)", value: -8.2, target: -10.0, status: "good" },
  { metric: "Volatility", value: 18.7, target: 20.0, status: "good" },
];

const generateAIInsights = () => [
  {
    type: "prediction",
    confidence: 87,
    title: "BTC Price Movement",
    description: "High probability of 5-8% upward movement in next 24-48 hours",
    timeframe: "48h",
    impact: "high",
  },
  {
    type: "risk",
    confidence: 92,
    title: "Portfolio Risk Alert",
    description: "Current allocation shows overexposure to DeFi tokens",
    timeframe: "immediate",
    impact: "medium",
  },
  {
    type: "opportunity",
    confidence: 74,
    title: "Arbitrage Opportunity",
    description: "ETH price discrepancy detected across exchanges",
    timeframe: "15m",
    impact: "low",
  },
  {
    type: "trend",
    confidence: 89,
    title: "Market Sentiment Shift",
    description: "Social sentiment turning bullish on Layer 2 solutions",
    timeframe: "7d",
    impact: "high",
  },
];

export default function AnalyticsDashboard() {
  const [performanceData] = useState(generatePerformanceData());
  const [tradingMetrics] = useState(generateTradingMetrics());
  const [portfolioAllocation] = useState(generatePortfolioAllocation());
  const [riskMetrics] = useState(generateRiskMetrics());
  const [aiInsights] = useState(generateAIInsights());
  const [timeframe, setTimeframe] = useState("6m");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLastUpdate(new Date());
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "danger":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "border-l-red-400 bg-red-400/10";
      case "medium":
        return "border-l-yellow-400 bg-yellow-400/10";
      case "low":
        return "border-l-green-400 bg-green-400/10";
      default:
        return "border-l-gray-400 bg-gray-400/10";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-400" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Advanced portfolio and trading analytics powered by AI
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* AI Insights Bar */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${getImpactColor(
                    insight.impact
                  )}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {insight.timeframe}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-gray-400 text-xs">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="performance" className="text-gray-300">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-gray-300">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="trading" className="text-gray-300">
              <Activity className="h-4 w-4 mr-2" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-gray-300">
              <Shield className="h-4 w-4 mr-2" />
              Risk Analysis
            </TabsTrigger>
          </TabsList>

          {/* Performance Analytics */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {tradingMetrics.map((metric, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{metric.name}</p>
                        <p className="text-2xl font-bold text-white">
                          {metric.name.includes("Volume")
                            ? formatCurrency(metric.value)
                            : metric.name.includes("Time")
                            ? `${metric.value}h`
                            : metric.value}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          metric.trend > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {metric.trend > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm">
                          {Math.abs(metric.trend)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Portfolio Performance vs Benchmark
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="portfolio"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="url(#colorPortfolio)"
                      />
                      <Area
                        type="monotone"
                        dataKey="benchmark"
                        stackId="1"
                        stroke="#6b7280"
                        fill="url(#colorBenchmark)"
                      />
                      <defs>
                        <linearGradient
                          id="colorPortfolio"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorBenchmark"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6b7280"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6b7280"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Analytics */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={portfolioAllocation}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {portfolioAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Holdings Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolioAllocation.map((asset, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: asset.color }}
                          />
                          <span className="text-white font-medium">
                            {asset.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {formatCurrency(asset.amount)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {asset.value}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trading Analytics */}
          <TabsContent value="trading" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Trading Activity & Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="trades" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Analysis */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskMetrics.map((metric, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                      >
                        <div>
                          <span className="text-white font-medium">
                            {metric.metric}
                          </span>
                          <div className="text-gray-400 text-sm">
                            Target: {metric.target}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-semibold ${getStatusColor(
                              metric.status
                            )}`}
                          >
                            {metric.value}%
                          </div>
                          {metric.status === "good" ? (
                            <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-400 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Risk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={riskMetrics}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis
                          dataKey="metric"
                          className="text-gray-400"
                        />
                        <PolarRadiusAxis stroke="#374151" />
                        <Radar
                          name="Current"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="Target"
                          dataKey="target"
                          stroke="#6b7280"
                          fill="#6b7280"
                          fillOpacity={0.1}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
