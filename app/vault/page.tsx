"use client";

import React, { useState, useRef } from "react";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Coins,
  ListOrdered,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Helper to fetch SOL price if not present in tokens

async function fetchSolPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    );

    const data = await res.json();

    return data.solana?.usd ?? null;
  } catch {
    return null;
  }
}

// Helper function to format price with subscript notation for leading zeros

function formatPriceWithSubscript(price: number): React.ReactNode {
  if (price === 0) return "$0";

  const priceStr = price.toString();

  const [integerPart, decimalPart] = priceStr.split(".");

  if (!decimalPart) {
    return `$${integerPart}`;
  }

  // Count leading zeros in decimal part

  let leadingZeros = 0;

  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] === "0") {
      leadingZeros++;
    } else {
      break;
    }
  }

  if (leadingZeros === 0) {
    // No leading zeros, show only 2 decimal places

    return `$${price.toFixed(2)}`;
  }

  const significantDigits = decimalPart.substring(leadingZeros);

  if (leadingZeros > 0 && significantDigits.length > 0) {
    // Only show first 4 significant digits

    const displayDigits = significantDigits.substring(0, 4);

    return (
      <span>
        ${integerPart}.0<sub>{leadingZeros}</sub>
        {displayDigits}
      </span>
    );
  }

  return `$${priceStr}`;
}

// Helper: fallback avatar for token
function TokenAvatar({ symbol, logo }: { symbol: string; logo?: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={symbol}
        className="w-4 h-4 rounded-full bg-gray-700 object-cover"
      />
    );
  }
  return (
    <span className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white uppercase">
      {symbol?.[0] || "?"}
    </span>
  );
}

export default function VaultPage() {
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [portfolio, setPortfolio] = useState<{
    nativeBalance?: { solana: string };
    tokens?: any[];
    totalSwaps?: number;
    swaps?: any[];
    change24h?: {
      absolute: number;
      percentage: number;
      timestamp: string;
    };
  } | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [showSolPriceWarning, setShowSolPriceWarning] = useState(false);
  // Pagination for Performance by Token table (must be after tokenPnL is defined)
  const [tokenTablePage, setTokenTablePage] = useState(1);
  const TOKENS_PER_PAGE = 25;
  // Ref for Performance by Token section
  const perfTokenRef = useRef<HTMLDivElement>(null);

  // Sorting state for Performance by Token table
  const [sortKey, setSortKey] = useState<string>("symbol");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Helper to handle sorting
  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
    setTokenTablePage(1);
    setTimeout(() => {
      perfTokenRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }

  // Calculate total portfolio value (USD)
  let totalValue = 0;
  let tokensValue = 0;
  if (portfolio && portfolio.tokens) {
    for (const token of portfolio.tokens) {
      if (typeof token.valueUsd === "number") {
        tokensValue += token.valueUsd;
      } else if (token.price && token.amount) {
        tokensValue += Number(token.price) * Number(token.amount);
      }
    }
  }
  totalValue += tokensValue;

  // Native SOL balance (in tokens and USD)
  let nativeSol = portfolio?.nativeBalance?.solana
    ? Number(portfolio.nativeBalance.solana)
    : null;
  let nativeSolUsd = null;
  if (nativeSol && solPrice) {
    nativeSolUsd = nativeSol * solPrice;
    // Only add native SOL to total if not already included in tokens
    const hasSolToken = portfolio?.tokens?.some(
      (t) => t.symbol === "SOL" || t.name?.toLowerCase().includes("solana")
    );
    if (!hasSolToken) {
      totalValue += nativeSolUsd;
    }
  }

  // Filter tokens with value >= $1
  let filteredTokens: any[] = [];
  if (portfolio && portfolio.tokens) {
    filteredTokens = portfolio.tokens.filter((token) => {
      let value = 0;
      if (typeof token.valueUsd === "number") {
        value = token.valueUsd;
      } else if (token.price && token.amount) {
        value = Number(token.price) * Number(token.amount);
      }
      return value >= 1;
    });
  }

  // Calculate PnL from swaps
  let pnl: number | null = null;
  if (portfolio && portfolio.swaps && portfolio.swaps.length > 0) {
    let totalSell = 0;
    let totalBuy = 0;
    for (const tx of portfolio.swaps) {
      if (tx.transactionType === "sell" && tx.totalValueUsd) {
        totalSell += Number(tx.totalValueUsd);
      } else if (tx.transactionType === "buy" && tx.totalValueUsd) {
        totalBuy += Number(tx.totalValueUsd);
      }
    }
    pnl = totalSell - totalBuy;
  }

  // Calculate PnL for every individual token
  let tokenPnL: Record<
    string,
    {
      pnl: number;
      totalBuy: number;
      totalSell: number;
      unrealizedPnL: number;
      avgEntryPrice: number;
      avgSellPrice: number;
      totalAmountBought: number;
      totalAmountSold: number;
    }
  > = {};
  if (portfolio && portfolio.swaps && portfolio.swaps.length > 0) {
    for (const tx of portfolio.swaps) {
      // For buy, use bought.symbol; for sell, use sold.symbol
      if (
        tx.transactionType === "buy" &&
        tx.bought?.symbol &&
        tx.totalValueUsd
      ) {
        const symbol = tx.bought.symbol;
        if (!tokenPnL[symbol])
          tokenPnL[symbol] = {
            pnl: 0,
            totalBuy: 0,
            totalSell: 0,
            unrealizedPnL: 0,
            avgEntryPrice: 0,
            avgSellPrice: 0,
            totalAmountBought: 0,
            totalAmountSold: 0,
          };
        tokenPnL[symbol].totalBuy += Number(tx.totalValueUsd);
        tokenPnL[symbol].totalAmountBought += Number(tx.bought.amount || 0);
      }
      if (
        tx.transactionType === "sell" &&
        tx.sold?.symbol &&
        tx.totalValueUsd
      ) {
        const symbol = tx.sold.symbol;
        if (!tokenPnL[symbol])
          tokenPnL[symbol] = {
            pnl: 0,
            totalBuy: 0,
            totalSell: 0,
            unrealizedPnL: 0,
            avgEntryPrice: 0,
            avgSellPrice: 0,
            totalAmountBought: 0,
            totalAmountSold: 0,
          };
        tokenPnL[symbol].totalSell += Number(tx.totalValueUsd);
        tokenPnL[symbol].totalAmountSold += Number(tx.sold.amount || 0);
      }
    }
    // Calculate average entry price, average sell price, and PnL for each token
    for (const symbol in tokenPnL) {
      const stats = tokenPnL[symbol];
      stats.pnl = stats.totalSell - stats.totalBuy;
      // Calculate average entry price
      if (stats.totalAmountBought > 0) {
        stats.avgEntryPrice = stats.totalBuy / stats.totalAmountBought;
      }
      // Calculate average sell price
      if (stats.totalAmountSold > 0) {
        stats.avgSellPrice = stats.totalSell / stats.totalAmountSold;
      }
      // Calculate unrealized PnL for tokens still held
      const currentToken = portfolio?.tokens?.find((t) => t.symbol === symbol);
      if (currentToken && currentToken.price) {
        const currentValue =
          Number(currentToken.price) * Number(currentToken.amount);
        const netCost = stats.totalBuy - stats.totalSell;
        stats.unrealizedPnL = currentValue - netCost;
      }
    }
  }
  // Calculate allocation percentages for tokens
  let tokenAllocations: Record<string, { value: number; percentage: number }> =
    {};

  if (portfolio && portfolio.tokens && totalValue > 0) {
    for (const token of portfolio.tokens) {
      const tokenValue = token.price
        ? Number(token.price) * Number(token.amount)
        : 0;

      if (tokenValue >= 1) {
        // Only include tokens worth $1 or more

        const percentage = (tokenValue / totalValue) * 100;

        tokenAllocations[token.symbol] = { value: tokenValue, percentage };
      }
    }

    // Add native SOL if significant

    if (nativeSolUsd !== null && nativeSolUsd >= 1) {
      const percentage = (nativeSolUsd / totalValue) * 100;

      tokenAllocations["SOL"] = { value: nativeSolUsd, percentage };
    }
  }

  // Sorting logic for tokenPnLEntries
  const sortableTokenPnLEntries = Object.entries(tokenPnL).map(
    ([symbol, stats]) => {
      // Find allocation and logo for sorting
      const allocation = tokenAllocations[symbol]?.percentage || 0;
      const avgEntry = stats.avgEntryPrice || 0;
      const avgSell = stats.avgSellPrice || 0;
      return {
        symbol,
        stats,
        allocation,
        avgEntry,
        avgSell,
      };
    }
  );

  sortableTokenPnLEntries.sort((a, b) => {
    let vA, vB;
    switch (sortKey) {
      case "symbol":
        vA = a.symbol.toUpperCase();
        vB = b.symbol.toUpperCase();
        if (vA < vB) return sortDirection === "asc" ? -1 : 1;
        if (vA > vB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      case "allocation":
        vA = a.allocation;
        vB = b.allocation;
        break;
      case "pnl":
        vA = a.stats.pnl;
        vB = b.stats.pnl;
        break;
      case "unrealizedPnL":
        vA = a.stats.unrealizedPnL;
        vB = b.stats.unrealizedPnL;
        break;
      case "avgEntry":
        vA = a.avgEntry;
        vB = b.avgEntry;
        break;
      case "avgSell":
        vA = a.avgSell;
        vB = b.avgSell;
        break;
      case "totalBuy":
        vA = a.stats.totalBuy;
        vB = b.stats.totalBuy;
        break;
      case "totalSell":
        vA = a.stats.totalSell;
        vB = b.stats.totalSell;
        break;
      default:
        vA = 0;
        vB = 0;
    }
    if (vA < vB) return sortDirection === "asc" ? -1 : 1;
    if (vA > vB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination for Performance by Token table
  const tokenPnLEntries = sortableTokenPnLEntries.map(
    ({ symbol, stats }) => [symbol, stats] as [string, typeof stats]
  );
  const totalTokenPages = Math.ceil(tokenPnLEntries.length / TOKENS_PER_PAGE);
  const paginatedTokenPnLEntries = tokenPnLEntries.slice(
    (tokenTablePage - 1) * TOKENS_PER_PAGE,
    tokenTablePage * TOKENS_PER_PAGE
  );

  // Calculate total unrealized PnL
  const totalUnrealizedPnL = Object.values(tokenPnL).reduce(
    (sum, stats) => sum + stats.unrealizedPnL,
    0
  );

  // Generate colors for pie chart - using same colors as Aegis page

  const COLORS = [
    "#8884d8",

    "#82ca9d",

    "#ffc658",

    "#ff8042",

    "#0088FE",

    "#00C49F",

    "#FFBB28",

    "#FF6699",

    "#A28BFE",

    "#B6E880",
  ];

  // Prepare pie chart data

  const pieChartData = Object.entries(tokenAllocations)

    .sort(([, a], [, b]) => b.percentage - a.percentage)

    .map(([symbol, data]) => ({
      name: symbol,

      value: Number(data.percentage.toFixed(2)),

      usdValue: data.value,
    }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    setError("");

    setPortfolio(null);

    setSolPrice(null);

    setShowSolPriceWarning(false);

    try {
      const res = await fetch("/api/vault", {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ address: wallet }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unknown error");

      setPortfolio(data);

      // Try to get SOL price from tokens, else fetch from API

      let solToken = null;

      if (data.tokens) {
        solToken = data.tokens.find(
          (t: any) =>
            t.symbol === "SOL" || t.name?.toLowerCase().includes("solana")
        );
      }

      if (solToken && solToken.price) {
        setSolPrice(Number(solToken.price));
      } else {
        const fetched = await fetchSolPrice();

        if (fetched) setSolPrice(fetched);
        else setShowSolPriceWarning(true);
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-24 pb-10 bg-[#10101a]">
      <div className="flex flex-col gap-4 w-full max-w-5xl">
        <form
          className="grid grid-cols-[7fr_1fr] gap-2 w-full bg-gray-900/60 rounded-lg p-4"
          onSubmit={handleSubmit}
        >
          <input
            id="wallet"
            name="wallet"
            type="text"
            placeholder="Enter wallet address"
            className="px-4 py-2 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            disabled={loading || !wallet}
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>
        <div className="rounded-lg bg-gray-900/60 flex flex-col">
          <div className="grid grid-cols-[1fr_1fr_1fr] w-full max-w-5xl">
            {/* Stat Card */}
            <div className="p-8 px-10 flex flex-col gap-2 relative">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <h1 className="text-xl font-bold text-white">
                  Total Portfolio Value
                </h1>
              </div>
              <h1 className="text-4xl font-bold text-cyan-400">
                $
                {totalValue.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </h1>
              <p className="text-gray-400">
                Last 24h: {portfolio?.change24h?.percentage.toFixed(2)}%
              </p>
              <div className="absolute right-0 h-2/3 w-px bg-gray-800" />
            </div>
            <div className="p-8 px-10 flex flex-col gap-2 relative">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h1 className="text-xl font-bold text-white">Realized PnL</h1>
              </div>
              <h1
                className={`text-4xl font-bold ${
                  pnl && pnl > 0
                    ? "text-green-400"
                    : pnl && pnl < 0
                    ? "text-red-400"
                    : "text-white"
                }`}
              >
                ${pnl?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h1>
              <p className="text-gray-400">
                Last 24h: {portfolio?.change24h?.percentage.toFixed(2)}%
              </p>
              <div className="absolute right-0 h-2/3 w-px bg-gray-800" />
            </div>
            <div className="p-8 px-10 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-5 h-5 text-yellow-400" />
                <h1 className="text-xl font-bold text-white">Unrealized PnL</h1>
              </div>
              <h1
                className={`text-4xl font-bold ${
                  totalUnrealizedPnL > 0
                    ? "text-emerald-400"
                    : totalUnrealizedPnL < 0
                    ? "text-red-400"
                    : "text-white"
                }`}
              >
                $
                {totalUnrealizedPnL.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </h1>
              <p className="text-gray-400">
                Last 24h: {portfolio?.change24h?.percentage.toFixed(2)}%
              </p>
            </div>
          </div>
          <hr className="w-[90%] pt-4 mx-auto border-gray-800" />
          <div className="pb-6 grid grid-cols-[1fr_1fr_1fr] w-full max-w-5xl">
            <div className="px-10 flex flex-col gap-2 relative">
              <p className="text-left">
                Win Rate:{" "}
                <span
                  className={`font-bold ${
                    ((portfolio?.totalSwaps || 0) /
                      (portfolio?.totalSwaps || 1)) *
                      100 >=
                    50
                      ? "text-green-400"
                      : ((portfolio?.totalSwaps || 0) /
                          (portfolio?.totalSwaps || 1)) *
                          100 >=
                        20
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {((portfolio?.totalSwaps || 0) /
                    (portfolio?.totalSwaps || 1)) *
                    100}
                  %
                </span>
              </p>
            </div>
            <div className="px-10 flex flex-col gap-2 relative">
              <p className="text-left">
                Total Tokens:{" "}
                <span className="font-bold text-blue-400">
                  {filteredTokens.length}
                </span>
              </p>
            </div>
            <div className="px-10 flex flex-col gap-2">
              <p className="text-left">
                Total Transactions:{" "}
                <span className="font-bold text-purple-400">
                  {portfolio?.totalSwaps}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg grid grid-cols-[1fr_1fr] gap-4">
          <div className="bg-gray-900/60 p-8 px-10 flex flex-col gap-2 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <h1 className="text-2xl font-bold text-white">
                Portfolio Allocation
              </h1>
            </div>
            <div className="flex justify-center">
              <div className="w-80 h-80 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#232d3f",
                        border: "1px solid #333",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#eee" }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value}%`,
                        `${name} - $${props.payload.usdValue.toLocaleString(
                          undefined,
                          { maximumFractionDigits: 0 }
                        )}`,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-white/60 text-sm">Total Value</span>
                  <span className="text-white font-bold text-2xl">
                    $
                    {totalValue.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/60 p-8 px-10 flex flex-col gap-2 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ListOrdered className="w-5 h-5 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Tokens</h1>
            </div>
            <div className="flex flex-col gap-2 mt-2 h-80 overflow-y-auto scrollbar-thin custom-scrollbar">
              {filteredTokens.map((token) => {
                // Find PnL for this token
                const stats = tokenPnL[token.symbol];
                const pnl = stats ? stats.pnl : 0;
                const isProfit = pnl > 0;
                const allocation = tokenAllocations[token.symbol]?.percentage;
                const tokenAddress = token.mint;
                return (
                  <div
                    key={token.symbol}
                    className="flex items-center gap-2 bg-gray-800/60 px-4 py-2 rounded-lg"
                  >
                    <TokenAvatar symbol={token.symbol} logo={token.logo} />
                    {tokenAddress ? (
                      <a
                        href={`https://dexscreener.com/solana/${tokenAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-400 font-bold flex items-center gap-1 hover:underline focus:underline outline-none cursor-pointer"
                      >
                        {token.symbol}
                        {isProfit ? (
                          <ArrowUpRight className="w-3 h-3 text-green-400" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                        )}
                      </a>
                    ) : (
                      <span className="text-pink-400 font-bold flex items-center gap-1">
                        {token.symbol}
                        {isProfit ? (
                          <ArrowUpRight className="w-3 h-3 text-green-400" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                        )}
                      </span>
                    )}
                    <span className="ml-auto text-xs text-yellow-400 font-bold">
                      {allocation !== undefined
                        ? `${allocation.toFixed(1)}%`
                        : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="rounded-lg grid grid-cols-[1fr] gap-4">
          <div
            ref={perfTokenRef}
            className="bg-gray-900/60 p-8 px-10 flex flex-col gap-2 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">
                Performance by Token
              </h1>
            </div>
            <div className="overflow-x-auto mt-4 -mb-2">
              <table className="min-w-full text-sm text-left">
                <thead className="text-white/60">
                  <tr>
                    <th className="p-2 text-left">
                      <div
                        className="flex items-center gap-1 cursor-pointer select-none"
                        onClick={() => handleSort("symbol")}
                      >
                        Token
                        {sortKey === "symbol" && (
                          <span
                            className={`ml-1 text-[8px] ${
                              sortDirection === "asc"
                                ? "text-blue-400"
                                : "text-blue-400"
                            }`}
                          >
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="p-2 text-center">
                      <div
                        className="flex items-center gap-1 justify-center cursor-pointer select-none"
                        onClick={() => handleSort("allocation")}
                      >
                        Allocation (%)
                        {sortKey === "allocation" && (
                          <span className={`ml-1 text-[8px] text-blue-400`}>
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="p-2 text-right">
                      <div
                        className="flex items-center gap-1 justify-end cursor-pointer select-none"
                        onClick={() => handleSort("pnl")}
                      >
                        PnL
                        {sortKey === "pnl" && (
                          <span className={`ml-1 text-[8px] text-blue-400`}>
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="p-2 text-right">
                      <div
                        className="flex items-center gap-1 justify-end cursor-pointer select-none"
                        onClick={() => handleSort("unrealizedPnL")}
                      >
                        Unrealized PnL
                        {sortKey === "unrealizedPnL" && (
                          <span className={`ml-1 text-[8px] text-blue-400`}>
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="p-2 text-right">
                      <div
                        className="flex items-center gap-1 justify-end cursor-pointer select-none"
                        onClick={() => handleSort("avgEntry")}
                      >
                        Avg Entry Price
                        {sortKey === "avgEntry" && (
                          <span className={`ml-1 text-[8px] text-blue-400`}>
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="p-2 text-right">
                      <div
                        className="flex items-center gap-1 justify-end cursor-pointer select-none"
                        onClick={() => handleSort("avgSell")}
                      >
                        Sold Avg Price
                        {sortKey === "avgSell" && (
                          <span className={`ml-1 text-[8px] text-blue-400`}>
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="p-2 text-right">
                      <div
                        className="flex items-center gap-1 justify-end cursor-pointer select-none"
                        onClick={() => handleSort("totalBuy")}
                      >
                        Total Buys
                        {sortKey === "totalBuy" && (
                          <span className={`ml-1 text-[8px] text-blue-400`}>
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="p-2 text-right">
                      <div
                        className="flex items-center gap-1 justify-end cursor-pointer select-none"
                        onClick={() => handleSort("totalSell")}
                      >
                        Total Sells
                        {sortKey === "totalSell" && (
                          <span className={`ml-1 text-[8px] text-blue-400`}>
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTokenPnLEntries.map(([symbol, stats]) => {
                    // Find the token in portfolio.tokens to get the logo
                    const tokenObj = portfolio?.tokens?.find(
                      (t) => t.symbol === symbol
                    );
                    const logo = tokenObj?.logo;
                    const tokenAddress = tokenObj?.mint;
                    return (
                      <tr key={symbol} className="border-t border-white/10">
                        <td className="p-2 font-semibold">
                          <div className="flex items-center gap-2 w-full">
                            <TokenAvatar symbol={symbol} logo={logo} />
                            {tokenAddress ? (
                              <a
                                href={`https://dexscreener.com/solana/${tokenAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-400 font-bold hover:underline focus:underline outline-none cursor-pointer"
                              >
                                {symbol}
                              </a>
                            ) : (
                              <span className="text-pink-400 font-bold">
                                {symbol}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2 text-center text-yellow-400 font-bold">
                          {tokenAllocations[symbol]
                            ? `${tokenAllocations[symbol].percentage.toFixed(
                                1
                              )}%`
                            : "-"}
                        </td>
                        <td
                          className={`p-2 text-right font-bold ${
                            stats.pnl > 0
                              ? "text-green-400"
                              : stats.pnl < 0
                              ? "text-red-400"
                              : "text-white"
                          }`}
                        >
                          $
                          {stats.pnl.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td
                          className={`p-2 text-right font-bold ${
                            stats.unrealizedPnL > 0
                              ? "text-green-400"
                              : stats.unrealizedPnL < 0
                              ? "text-red-400"
                              : "text-white"
                          }`}
                        >
                          $
                          {stats.unrealizedPnL.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="p-2 text-right">
                          {stats.avgEntryPrice > 0
                            ? formatPriceWithSubscript(stats.avgEntryPrice)
                            : "-"}
                        </td>
                        <td className="p-2 text-right">
                          {stats.avgSellPrice > 0 ? (
                            <div className="flex flex-col items-end">
                              <div>
                                {formatPriceWithSubscript(stats.avgSellPrice)}
                              </div>
                              {stats.avgEntryPrice > 0 && (
                                <div
                                  className={`text-xs ${
                                    stats.avgSellPrice > stats.avgEntryPrice
                                      ? "text-green-400"
                                      : stats.avgSellPrice < stats.avgEntryPrice
                                      ? "text-red-400"
                                      : "text-white/60"
                                  }`}
                                >
                                  {(
                                    stats.avgSellPrice / stats.avgEntryPrice
                                  ).toFixed(2)}
                                  x
                                </div>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-2 text-right">
                          $
                          {stats.totalBuy.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="p-2 text-right">
                          $
                          {stats.totalSell.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Pagination controls */}
              {totalTokenPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    className="px-2 py-1 rounded bg-gray-800 text-white disabled:opacity-50"
                    onClick={() => {
                      setTokenTablePage((p) => {
                        const next = Math.max(1, p - 1);
                        setTimeout(() => {
                          perfTokenRef.current?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }, 0);
                        return next;
                      });
                    }}
                    disabled={tokenTablePage === 1}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalTokenPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={`px-2 py-1 rounded ${
                          page === tokenTablePage
                            ? "bg-blue-600 text-white font-bold"
                            : "bg-gray-800 text-white"
                        }`}
                        onClick={() => {
                          setTokenTablePage(page);
                          setTimeout(() => {
                            perfTokenRef.current?.scrollIntoView({
                              behavior: "smooth",
                            });
                          }, 0);
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    className="px-2 py-1 rounded bg-gray-800 text-white disabled:opacity-50"
                    onClick={() => {
                      setTokenTablePage((p) => {
                        const next = Math.min(totalTokenPages, p + 1);
                        setTimeout(() => {
                          perfTokenRef.current?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }, 0);
                        return next;
                      });
                    }}
                    disabled={tokenTablePage === totalTokenPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
