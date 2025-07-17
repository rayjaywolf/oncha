"use client";

import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Globe,
  Database,
  Activity,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface ApiService {
  id: string;
  name: string;
  description: string;
  status: "online" | "offline" | "degraded" | "maintenance";
  responseTime: number;
  uptime: number;
  lastUpdate: Date;
  endpoint: string;
  region: string;
  version: string;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  trend: "up" | "down" | "stable";
}

const ApiStatusDashboard: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const [services, setServices] = useState<ApiService[]>([
    {
      id: "coingecko",
      name: "CoinGecko API",
      description: "Market data and price feeds",
      status: "online",
      responseTime: 245,
      uptime: 99.95,
      lastUpdate: new Date(),
      endpoint: "api.coingecko.com/api/v3",
      region: "Global",
      version: "v3",
    },
    {
      id: "dexscreener",
      name: "DexScreener API",
      description: "DEX trading data and analytics",
      status: "online",
      responseTime: 180,
      uptime: 99.87,
      lastUpdate: new Date(),
      endpoint: "api.dexscreener.com/latest",
      region: "US-East",
      version: "latest",
    },
    {
      id: "moralis",
      name: "Moralis Web3 API",
      description: "Blockchain data and NFT analytics",
      status: "degraded",
      responseTime: 450,
      uptime: 98.92,
      lastUpdate: new Date(),
      endpoint: "deep-index.moralis.io/api/v2",
      region: "US-West",
      version: "v2",
    },
    {
      id: "tavily",
      name: "Tavily Search API",
      description: "AI-powered web search and news",
      status: "online",
      responseTime: 320,
      uptime: 99.78,
      lastUpdate: new Date(),
      endpoint: "api.tavily.com/search",
      region: "Global",
      version: "v1",
    },
    {
      id: "gemini",
      name: "Google Gemini API",
      description: "AI analysis and predictions",
      status: "online",
      responseTime: 890,
      uptime: 99.45,
      lastUpdate: new Date(),
      endpoint: "generativelanguage.googleapis.com",
      region: "Global",
      version: "v1beta",
    },
    {
      id: "internal",
      name: "Internal Chat API",
      description: "Oncha chat processing service",
      status: "online",
      responseTime: 125,
      uptime: 99.99,
      lastUpdate: new Date(),
      endpoint: "/api/chat",
      region: "US-East",
      version: "v1",
    },
  ]);

  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: "Request Volume",
      value: 1247,
      unit: "req/min",
      status: "good",
      trend: "up",
    },
    {
      name: "Error Rate",
      value: 0.3,
      unit: "%",
      status: "good",
      trend: "down",
    },
    {
      name: "Cache Hit Rate",
      value: 94.2,
      unit: "%",
      status: "good",
      trend: "stable",
    },
    {
      name: "Data Freshness",
      value: 15,
      unit: "sec",
      status: "good",
      trend: "stable",
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((service) => ({
          ...service,
          responseTime: Math.max(
            50,
            service.responseTime + (Math.random() - 0.5) * 100
          ),
          uptime: Math.min(
            100,
            Math.max(95, service.uptime + (Math.random() - 0.5) * 0.1)
          ),
          lastUpdate: new Date(),
        }))
      );

      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * (metric.value * 0.1),
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-400";
      case "degraded":
        return "text-yellow-400";
      case "offline":
        return "text-red-400";
      case "maintenance":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4" />;
      case "offline":
        return <WifiOff className="w-4 h-4" />;
      case "maintenance":
        return <Clock className="w-4 h-4" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case "down":
        return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
      default:
        return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const refreshStatus = async () => {
    setIsRefreshing(true);
    // Simulate API calls
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const onlineServices = services.filter((s) => s.status === "online").length;
  const avgResponseTime = Math.round(
    services.reduce((sum, s) => sum + s.responseTime, 0) / services.length
  );
  const avgUptime = (
    services.reduce((sum, s) => sum + s.uptime, 0) / services.length
  ).toFixed(2);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">API Status</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshStatus}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Checking..." : "Refresh"}
          </button>
          <span className="text-sm text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Services Online</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {onlineServices}/{services.length}
          </div>
          <div className="text-xs text-gray-500">
            {((onlineServices / services.length) * 100).toFixed(1)}% operational
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Avg Response</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {avgResponseTime}ms
          </div>
          <div className="text-xs text-gray-500">API response time</div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">System Uptime</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgUptime}%</div>
          <div className="text-xs text-gray-500">Last 30 days</div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Data Sources</span>
          </div>
          <div className="text-2xl font-bold text-white">{services.length}</div>
          <div className="text-xs text-gray-500">Active integrations</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Services Status */}
        <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Service Status</h3>
          </div>

          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">
                        {service.name}
                      </h4>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        {service.version}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {service.description}
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      {service.endpoint} • {service.region}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div
                    className={`text-sm font-medium ${getStatusColor(
                      service.status
                    )}`}
                  >
                    {service.status.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {service.responseTime}ms • {service.uptime.toFixed(2)}%
                    uptime
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated{" "}
                    {Math.floor(
                      (Date.now() - service.lastUpdate.getTime()) / 60000
                    )}
                    m ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div className="space-y-6">
          <div className="bg-gray-900/60 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">System Metrics</h3>
            </div>

            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{metric.name}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span
                        className={`text-sm font-medium ${getMetricStatusColor(
                          metric.status
                        )}`}
                      >
                        {metric.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">
                      {metric.value.toFixed(
                        metric.name === "Error Rate" ? 1 : 0
                      )}
                      <span className="text-sm text-gray-400 ml-1">
                        {metric.unit}
                      </span>
                    </span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          metric.status === "good"
                            ? "bg-green-400"
                            : metric.status === "warning"
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (metric.value /
                              (metric.name === "Error Rate" ? 5 : 100)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Recent Events</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">
                    All systems operational
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  All services running normally with optimal performance
                </p>
                <div className="text-xs text-gray-500 mt-1">2 minutes ago</div>
              </div>

              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">
                    Moralis API degraded
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Increased response times detected, monitoring situation
                </p>
                <div className="text-xs text-gray-500 mt-1">1 hour ago</div>
              </div>

              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">
                    Scheduled maintenance completed
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Database optimization completed successfully
                </p>
                <div className="text-xs text-gray-500 mt-1">6 hours ago</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
              >
                View all incidents
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatusDashboard;
