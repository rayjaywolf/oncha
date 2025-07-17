"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Shield,
  Users,
  Activity,
  Server,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Wifi,
  Lock,
  Unlock,
  UserX,
  UserCheck,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Bell,
  MessageSquare,
  Zap,
  Globe,
  Monitor,
  BarChart3,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data generators
const generateSystemMetrics = () => ({
  cpu: Math.floor(Math.random() * 40) + 20, // 20-60%
  memory: Math.floor(Math.random() * 30) + 40, // 40-70%
  disk: Math.floor(Math.random() * 20) + 30, // 30-50%
  network: Math.floor(Math.random() * 100) + 50, // 50-150 Mbps
  uptime: "99.8%",
  requests: Math.floor(Math.random() * 1000) + 5000, // 5k-6k
  errors: Math.floor(Math.random() * 10) + 2, // 2-12
  activeUsers: Math.floor(Math.random() * 500) + 2500, // 2.5k-3k
});

const generatePerformanceData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: `${i}:00`,
      cpu: Math.floor(Math.random() * 40) + 20,
      memory: Math.floor(Math.random() * 30) + 40,
      users: Math.floor(Math.random() * 500) + 2000,
      requests: Math.floor(Math.random() * 2000) + 3000,
      errors: Math.floor(Math.random() * 20) + 5,
    });
  }
  return data;
};

const generateUsers = () => [
  {
    id: "1",
    username: "trader_pro_2024",
    email: "trader@example.com",
    status: "active",
    role: "premium",
    lastActive: "2 min ago",
    trades: 847,
    profit: 12450,
    riskScore: "low",
  },
  {
    id: "2",
    username: "crypto_whale",
    email: "whale@example.com",
    status: "active",
    role: "premium",
    lastActive: "5 min ago",
    trades: 1250,
    profit: 45680,
    riskScore: "medium",
  },
  {
    id: "3",
    username: "defi_master",
    email: "defi@example.com",
    status: "suspended",
    role: "free",
    lastActive: "1 hour ago",
    trades: 234,
    profit: -2100,
    riskScore: "high",
  },
  {
    id: "4",
    username: "hodl_forever",
    email: "hodl@example.com",
    status: "active",
    role: "basic",
    lastActive: "15 min ago",
    trades: 98,
    profit: 3250,
    riskScore: "low",
  },
];

const generateSecurityEvents = () => [
  {
    id: "1",
    type: "suspicious_login",
    severity: "high",
    user: "trader_pro_2024",
    description: "Multiple failed login attempts from unusual location",
    timestamp: new Date(Date.now() - 5 * 60000),
    resolved: false,
  },
  {
    id: "2",
    type: "rug_pull_detected",
    severity: "critical",
    user: "crypto_whale",
    description: "Potential rug pull detected in DeFi position",
    timestamp: new Date(Date.now() - 15 * 60000),
    resolved: true,
  },
  {
    id: "3",
    type: "api_rate_limit",
    severity: "medium",
    user: "defi_master",
    description: "API rate limit exceeded",
    timestamp: new Date(Date.now() - 30 * 60000),
    resolved: false,
  },
];

const generateTradeControls = () => ({
  tradingEnabled: true,
  maintenanceMode: false,
  emergencyStop: false,
  maxPositionSize: 100000,
  maxDailyVolume: 1000000,
  riskThreshold: 0.05,
  autoLiquidation: true,
  slippageTolerance: 0.01,
});

export default function AdminPanel() {
  const [systemMetrics, setSystemMetrics] = useState(generateSystemMetrics());
  const [performanceData] = useState(generatePerformanceData());
  const [users] = useState(generateUsers());
  const [securityEvents] = useState(generateSecurityEvents());
  const [tradeControls, setTradeControls] = useState(generateTradeControls());
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(generateSystemMetrics());
      setLastUpdate(new Date());
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSystemMetrics(generateSystemMetrics());
    setLastUpdate(new Date());
    setRefreshing(false);
  };

  const handleTradeControlUpdate = (key: string, value: any) => {
    setTradeControls((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400";
      case "suspended":
        return "text-red-400";
      case "inactive":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-400/10 border-red-400";
      case "high":
        return "text-orange-400 bg-orange-400/10 border-orange-400";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400";
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400";
    }
  };

  const formatCurrency = (value: number) => {
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
              <Shield className="h-8 w-8 text-red-400" />
              Admin Control Panel
            </h1>
            <p className="text-gray-400 mt-1">
              System monitoring and platform management
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
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">
                    {systemMetrics.activeUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-green-500/20 text-green-400">
                  +12.5% from yesterday
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">System Uptime</p>
                  <p className="text-2xl font-bold text-white">
                    {systemMetrics.uptime}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-green-500/20 text-green-400">
                  Excellent
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">API Requests</p>
                  <p className="text-2xl font-bold text-white">
                    {systemMetrics.requests.toLocaleString()}/hr
                  </p>
                </div>
                <Server className="h-8 w-8 text-purple-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  Normal Load
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">System Errors</p>
                  <p className="text-2xl font-bold text-white">
                    {systemMetrics.errors}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-green-500/20 text-green-400">
                  Within Normal Range
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="system" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="system" className="text-gray-300">
              <Monitor className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="users" className="text-gray-300">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="security" className="text-gray-300">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="trading" className="text-gray-300">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trading Controls
            </TabsTrigger>
          </TabsList>

          {/* System Monitoring */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">CPU Usage</span>
                    <Cpu className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {systemMetrics.cpu}%
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemMetrics.cpu}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Memory</span>
                    <HardDrive className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {systemMetrics.memory}%
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemMetrics.memory}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Disk Usage</span>
                    <Database className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {systemMetrics.disk}%
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemMetrics.disk}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Network</span>
                    <Wifi className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {systemMetrics.network} Mbps
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(systemMetrics.network, 100)}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  System Performance (24 Hours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="hour" stroke="#9ca3af" />
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
                        dataKey="cpu"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="memory"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {user.username}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-white font-medium">
                            {user.trades}
                          </div>
                          <div className="text-gray-400 text-xs">Trades</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`font-medium ${
                              user.profit > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatCurrency(user.profit)}
                          </div>
                          <div className="text-gray-400 text-xs">P&L</div>
                        </div>
                        <div className="text-center">
                          <Badge
                            className={`${
                              user.riskScore === "low"
                                ? "bg-green-500/20 text-green-400"
                                : user.riskScore === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {user.riskScore}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className={getStatusColor(user.status)}>
                            {user.status}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {user.lastActive}
                          </div>
                        </div>
                        <div className="flex gap-2">
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
                            className="text-gray-400 hover:text-green-400"
                          >
                            {user.status === "active" ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Events */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-400" />
                  Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border-l-4 ${getSeverityColor(
                        event.severity
                      )}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity}
                            </Badge>
                            <Badge variant="outline" className="text-gray-400">
                              {event.type.replace("_", " ")}
                            </Badge>
                            {event.resolved && (
                              <Badge className="bg-green-500/20 text-green-400">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-white text-sm mb-1">
                            User: {event.user}
                          </h4>
                          <p className="text-gray-300 text-sm mb-2">
                            {event.description}
                          </p>
                          <div className="text-xs text-gray-400">
                            {event.timestamp.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {!event.resolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-600"
                            >
                              Resolve
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400"
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Controls */}
          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Trading Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Trading Enabled</span>
                    <Switch
                      checked={tradeControls.tradingEnabled}
                      onCheckedChange={(value) =>
                        handleTradeControlUpdate("tradingEnabled", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Maintenance Mode</span>
                    <Switch
                      checked={tradeControls.maintenanceMode}
                      onCheckedChange={(value) =>
                        handleTradeControlUpdate("maintenanceMode", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Emergency Stop</span>
                    <Switch
                      checked={tradeControls.emergencyStop}
                      onCheckedChange={(value) =>
                        handleTradeControlUpdate("emergencyStop", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Auto Liquidation</span>
                    <Switch
                      checked={tradeControls.autoLiquidation}
                      onCheckedChange={(value) =>
                        handleTradeControlUpdate("autoLiquidation", value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Risk Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">
                      Max Position Size
                    </label>
                    <Input
                      type="number"
                      value={tradeControls.maxPositionSize}
                      onChange={(e) =>
                        handleTradeControlUpdate(
                          "maxPositionSize",
                          parseInt(e.target.value)
                        )
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">
                      Max Daily Volume
                    </label>
                    <Input
                      type="number"
                      value={tradeControls.maxDailyVolume}
                      onChange={(e) =>
                        handleTradeControlUpdate(
                          "maxDailyVolume",
                          parseInt(e.target.value)
                        )
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">
                      Risk Threshold (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tradeControls.riskThreshold}
                      onChange={(e) =>
                        handleTradeControlUpdate(
                          "riskThreshold",
                          parseFloat(e.target.value)
                        )
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">
                      Slippage Tolerance (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tradeControls.slippageTolerance}
                      onChange={(e) =>
                        handleTradeControlUpdate(
                          "slippageTolerance",
                          parseFloat(e.target.value)
                        )
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
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
