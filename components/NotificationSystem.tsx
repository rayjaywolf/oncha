"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  X,
  Volume2,
  VolumeX,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Clock,
  Star,
  Settings,
  MoreVertical,
  Trash2,
  Archive,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type:
    | "price_alert"
    | "trade_signal"
    | "portfolio"
    | "security"
    | "system"
    | "news";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  sound?: boolean;
  actionRequired?: boolean;
  metadata?: {
    symbol?: string;
    price?: number;
    change?: number;
    link?: string;
    confidence?: number;
  };
}

const notificationIcons = {
  price_alert: DollarSign,
  trade_signal: TrendingUp,
  portfolio: Star,
  security: Shield,
  system: Settings,
  news: Info,
};

const priorityColors = {
  low: "border-l-blue-400 bg-blue-400/10",
  medium: "border-l-yellow-400 bg-yellow-400/10",
  high: "border-l-orange-400 bg-orange-400/10",
  critical: "border-l-red-400 bg-red-400/10",
};

const priorityBadgeColors = {
  low: "bg-blue-500/20 text-blue-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  critical: "bg-red-500/20 text-red-400",
};

// Mock notification generator
const generateMockNotifications = (): Notification[] => {
  const notifications: Notification[] = [
    {
      id: "1",
      type: "trade_signal",
      priority: "high",
      title: "Strong Buy Signal - BTC",
      message:
        "AI algorithm detected strong bullish patterns for Bitcoin. 87% confidence.",
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      archived: false,
      sound: true,
      actionRequired: true,
      metadata: {
        symbol: "BTC",
        price: 43250,
        change: 3.2,
        confidence: 87,
      },
    },
    {
      id: "2",
      type: "price_alert",
      priority: "medium",
      title: "Price Target Reached",
      message: "Ethereum has reached your target price of $2,650.",
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false,
      archived: false,
      metadata: {
        symbol: "ETH",
        price: 2650,
        change: 1.8,
      },
    },
    {
      id: "3",
      type: "security",
      priority: "critical",
      title: "Potential Rug Pull Detected",
      message:
        "High-risk activity detected in your DeFi position. Immediate review recommended.",
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false,
      archived: false,
      sound: true,
      actionRequired: true,
      metadata: {
        symbol: "UNKNOWN_TOKEN",
        confidence: 95,
      },
    },
    {
      id: "4",
      type: "portfolio",
      priority: "low",
      title: "Portfolio Rebalancing Suggestion",
      message:
        "Your portfolio allocation has deviated from target. Consider rebalancing.",
      timestamp: new Date(Date.now() - 2 * 3600000),
      read: true,
      archived: false,
    },
    {
      id: "5",
      type: "news",
      priority: "medium",
      title: "Major Market News",
      message: "Fed announces new monetary policy affecting crypto markets.",
      timestamp: new Date(Date.now() - 4 * 3600000),
      read: false,
      archived: false,
      metadata: {
        link: "https://example.com/news",
      },
    },
    {
      id: "6",
      type: "trade_signal",
      priority: "high",
      title: "Sell Signal - SOL",
      message:
        "Technical indicators suggest selling opportunity for Solana. 82% confidence.",
      timestamp: new Date(Date.now() - 6 * 3600000),
      read: true,
      archived: false,
      metadata: {
        symbol: "SOL",
        price: 98.45,
        change: -2.1,
        confidence: 82,
      },
    },
  ];

  return notifications;
};

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>(
    generateMockNotifications()
  );
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (notification.archived) return false;

    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notification.read) ||
      (filter === "priority" &&
        ["high", "critical"].includes(notification.priority)) ||
      notification.type === filter;

    const matchesSearch =
      searchTerm === "" ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(
    (n) => !n.read && !n.archived
  ).length;
  const criticalCount = notifications.filter(
    (n) => n.priority === "critical" && !n.read && !n.archived
  ).length;

  // Simulate real-time notifications
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate new notification
      if (Math.random() < 0.3) {
        const newNotification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: ["price_alert", "trade_signal", "portfolio", "news"][
            Math.floor(Math.random() * 4)
          ] as any,
          priority: ["low", "medium", "high"][
            Math.floor(Math.random() * 3)
          ] as any,
          title: "New Market Alert",
          message: "Real-time market update detected.",
          timestamp: new Date(),
          read: false,
          archived: false,
          sound: soundEnabled,
        };

        setNotifications((prev) => [newNotification, ...prev]);

        // Play sound for important notifications
        if (
          soundEnabled &&
          ["high", "critical"].includes(newNotification.priority)
        ) {
          // Note: In a real app, you'd have actual sound files
          console.log("🔔 Sound notification played");
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh, soundEnabled]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const archiveNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    const IconComponent = notificationIcons[type];
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-400" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white px-2 py-1 text-xs">
                    {unreadCount}
                  </Badge>
                )}
                {criticalCount > 0 && (
                  <Badge className="bg-red-600 text-white px-2 py-1 text-xs animate-pulse">
                    {criticalCount} Critical
                  </Badge>
                )}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-gray-400 hover:text-white"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="priority">High Priority</option>
                <option value="price_alert">Price Alerts</option>
                <option value="trade_signal">Trade Signals</option>
                <option value="security">Security</option>
                <option value="portfolio">Portfolio</option>
                <option value="news">News</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Mark All Read
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <h3 className="text-white font-medium mb-3">
                Notification Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Sound Notifications</span>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Auto Refresh</span>
                  <Switch
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border-l-4 transition-all duration-200 hover:bg-gray-700/30",
                    priorityColors[notification.priority],
                    !notification.read && "ring-1 ring-blue-400/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <h4 className="font-medium text-white text-sm">
                          {notification.title}
                        </h4>
                        <Badge
                          className={priorityBadgeColors[notification.priority]}
                        >
                          {notification.priority}
                        </Badge>
                        {notification.actionRequired && (
                          <Badge className="bg-orange-500/20 text-orange-400">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {notification.metadata?.symbol && (
                          <span className="font-medium text-blue-400">
                            {notification.metadata.symbol}
                          </span>
                        )}
                        {notification.metadata?.price && (
                          <span>
                            ${notification.metadata.price.toLocaleString()}
                          </span>
                        )}
                        {notification.metadata?.change && (
                          <span
                            className={
                              notification.metadata.change > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {notification.metadata.change > 0 ? "+" : ""}
                            {notification.metadata.change}%
                          </span>
                        )}
                        {notification.metadata?.confidence && (
                          <span className="text-purple-400">
                            {notification.metadata.confidence}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => archiveNotification(notification.id)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
