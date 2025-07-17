"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  logo?: string;
  alerts: {
    priceAbove?: number;
    priceBelow?: number;
    volumeSpike?: boolean;
  };
  isAlertActive: boolean;
  addedAt: Date;
}

interface WatchlistProps {
  className?: string;
}

const Watchlist: React.FC<WatchlistProps> = ({ className = "" }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);
  const [sortBy, setSortBy] = useState<
    "symbol" | "price" | "change" | "volume" | "marketCap"
  >("symbol");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState<"all" | "gainers" | "losers" | "alerts">(
    "all"
  );
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load watchlist from localStorage on component mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("oncha-watchlist");
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        setWatchlist(
          parsed.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          }))
        );
      } catch (error) {
        console.error("Error loading watchlist:", error);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("oncha-watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Mock price update simulation (in real app, use WebSocket or API polling)
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist((prev) =>
        prev.map((item) => {
          const priceChange = (Math.random() - 0.5) * 0.02; // ±1% max change
          const newPrice = item.price * (1 + priceChange);
          const newChange24h = item.change24h + priceChange * item.price;
          const newChangePercent24h =
            (newChange24h / (item.price - item.change24h)) * 100;

          return {
            ...item,
            price: newPrice,
            change24h: newChange24h,
            changePercent24h: newChangePercent24h,
          };
        })
      );
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Add new symbol to watchlist
  const addSymbol = async (symbol: string) => {
    if (
      !symbol ||
      watchlist.some(
        (item) => item.symbol.toLowerCase() === symbol.toLowerCase()
      )
    ) {
      return;
    }

    setIsAddingSymbol(true);

    try {
      // Mock API call (replace with actual API)
      const mockData: WatchlistItem = {
        id: Date.now().toString(),
        symbol: symbol.toUpperCase(),
        name: `${symbol.charAt(0).toUpperCase() + symbol.slice(1)} Token`,
        price: Math.random() * 100 + 1,
        change24h: (Math.random() - 0.5) * 10,
        changePercent24h: (Math.random() - 0.5) * 20,
        volume24h: Math.random() * 1000000,
        marketCap: Math.random() * 10000000,
        alerts: {},
        isAlertActive: false,
        addedAt: new Date(),
      };

      setWatchlist((prev) => [...prev, mockData]);
      setNewSymbol("");
    } catch (error) {
      console.error("Error adding symbol:", error);
    } finally {
      setIsAddingSymbol(false);
    }
  };

  // Remove symbol from watchlist
  const removeSymbol = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle price alert
  const toggleAlert = (id: string) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAlertActive: !item.isAlertActive } : item
      )
    );
  };

  // Update price alerts
  const updatePriceAlert = (
    id: string,
    type: "above" | "below",
    value: number
  ) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              alerts: {
                ...item.alerts,
                [type === "above" ? "priceAbove" : "priceBelow"]: value,
              },
              isAlertActive: true,
            }
          : item
      )
    );
  };

  // Sort watchlist
  const sortedWatchlist = [...watchlist].sort((a, b) => {
    let aValue: number | string = a[sortBy];
    let bValue: number | string = b[sortBy];

    if (sortBy === "change") {
      aValue = a.changePercent24h;
      bValue = b.changePercent24h;
    }

    if (typeof aValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue);
    }

    return sortDirection === "asc"
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  // Filter watchlist
  const filteredWatchlist = sortedWatchlist.filter((item) => {
    switch (filter) {
      case "gainers":
        return item.changePercent24h > 0;
      case "losers":
        return item.changePercent24h < 0;
      case "alerts":
        return item.isAlertActive;
      default:
        return true;
    }
  });

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSortBy);
      setSortDirection("desc");
    }
  };

  return (
    <div
      className={`bg-gray-900/60 backdrop-blur-sm border border-white/20 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Watchlist</h2>
          <span className="text-sm text-gray-400">
            ({watchlist.length} tokens)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLastUpdate(new Date())}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-xs text-gray-500">
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Add Symbol Form */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Add symbol (e.g., BTC, ETH, SOL)"
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          onKeyPress={(e) => e.key === "Enter" && addSymbol(newSymbol)}
        />
        <button
          onClick={() => addSymbol(newSymbol)}
          disabled={isAddingSymbol || !newSymbol}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isAddingSymbol ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "All" },
          { key: "gainers", label: "Gainers" },
          { key: "losers", label: "Losers" },
          { key: "alerts", label: "Alerts" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === key
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Watchlist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-700">
            <tr>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => handleSort("symbol")}
              >
                <div className="flex items-center gap-1">
                  Symbol
                  {sortBy === "symbol" && (
                    <span className="text-blue-400">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-right p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center justify-end gap-1">
                  Price
                  {sortBy === "price" && (
                    <span className="text-blue-400">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-right p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => handleSort("change")}
              >
                <div className="flex items-center justify-end gap-1">
                  24h Change
                  {sortBy === "change" && (
                    <span className="text-blue-400">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-right p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => handleSort("volume")}
              >
                <div className="flex items-center justify-end gap-1">
                  Volume
                  {sortBy === "volume" && (
                    <span className="text-blue-400">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWatchlist.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  {watchlist.length === 0
                    ? "No tokens in watchlist. Add some symbols to get started!"
                    : "No tokens match the current filter."}
                </td>
              </tr>
            ) : (
              filteredWatchlist.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {item.symbol}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right text-white font-medium">
                    ${item.price.toFixed(4)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.changePercent24h >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span
                        className={`font-medium ${
                          item.changePercent24h >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {item.changePercent24h >= 0 ? "+" : ""}
                        {item.changePercent24h.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-gray-400">
                    ${(item.volume24h / 1000000).toFixed(2)}M
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleAlert(item.id)}
                        className={`p-1 rounded transition-colors ${
                          item.isAlertActive
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "text-gray-400 hover:text-white"
                        }`}
                        title={
                          item.isAlertActive
                            ? "Disable alerts"
                            : "Enable alerts"
                        }
                      >
                        {item.isAlertActive ? (
                          <Bell className="w-4 h-4" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            `https://dexscreener.com/search?q=${item.symbol}`,
                            "_blank"
                          )
                        }
                        className="p-1 rounded text-gray-400 hover:text-white transition-colors"
                        title="View on DexScreener"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeSymbol(item.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Stats */}
      {watchlist.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-400">Total Tokens</div>
              <div className="text-lg font-semibold text-white">
                {watchlist.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Gainers</div>
              <div className="text-lg font-semibold text-green-400">
                {watchlist.filter((item) => item.changePercent24h > 0).length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Losers</div>
              <div className="text-lg font-semibold text-red-400">
                {watchlist.filter((item) => item.changePercent24h < 0).length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Active Alerts</div>
              <div className="text-lg font-semibold text-yellow-400">
                {watchlist.filter((item) => item.isAlertActive).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
