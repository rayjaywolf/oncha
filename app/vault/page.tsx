"use client";

import React, { useState } from "react";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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

      const currentToken = portfolio.tokens?.find((t) => t.symbol === symbol);

      if (currentToken && currentToken.price) {
        const currentValue =
          Number(currentToken.price) * Number(currentToken.amount);

        const netCost = stats.totalBuy - stats.totalSell;

        stats.unrealizedPnL = currentValue - netCost;
      }
    }
  }

  // Calculate total unrealized PnL

  const totalUnrealizedPnL = Object.values(tokenPnL).reduce(
    (sum, stats) => sum + stats.unrealizedPnL,

    0
  );

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 bg-[#01010e]">
      <form
        className="flex flex-col gap-4 w-full max-w-sm bg-transparent"
        onSubmit={handleSubmit}
      >
        <label htmlFor="wallet" className="text-lg font-medium text-white/80">
          Wallet Address
        </label>

        <input
          id="wallet"
          name="wallet"
          type="text"
          placeholder="Enter wallet address"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#18181b] text-white placeholder:text-white/50"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
          disabled={loading || !wallet}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>

      {error && <div className="text-red-400 mt-4">{error}</div>}

      {showSolPriceWarning && (
        <div className="text-yellow-400 mt-4">
          Could not fetch SOL price. Native SOL value may be missing.
        </div>
      )}

      {portfolio && (
        <div className="mt-8 w-full max-w-md bg-[#18181b] rounded-lg p-6 text-white/90">
          <div className="text-xl font-bold mb-2">
            Total Portfolio Value (USD)
          </div>

          <div className="text-3xl font-bold mb-4">
            $
            {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>

          <div className="mb-2 text-white/70">
            Total Tokens:{" "}
            <span className="font-bold text-white">
              {filteredTokens.length}
            </span>
          </div>

          {typeof portfolio.totalSwaps === "number" && (
            <div className="mb-2 text-white/70">
              Total Swaps/Transactions:{" "}
              <span className="font-bold text-white">
                {portfolio.totalSwaps}
              </span>
            </div>
          )}

          <div className="mb-2 text-white/70">
            24h Change:{" "}
            {portfolio.change24h?.absolute !== undefined && (
              <span
                className={`ml-2 text-sm ${
                  portfolio.change24h.absolute > 0
                    ? "text-green-400"
                    : portfolio.change24h.absolute < 0
                    ? "text-red-400"
                    : "text-white/60"
                }`}
              >
                {portfolio.change24h.absolute >= 0 ? "+" : ""}$
                {portfolio.change24h.absolute.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            )}
          </div>

          <div className="mb-2 text-white/70">
            PnL:{" "}
            <span
              className={`font-bold ${
                pnl !== null
                  ? pnl > 0
                    ? "text-green-400"
                    : pnl < 0
                    ? "text-red-400"
                    : "text-white"
                  : "text-white"
              }`}
            >
              {pnl !== null
                ? `$${pnl.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}`
                : "-"}
            </span>
          </div>

          <div className="mb-2 text-white/70">
            Unrealized PnL:{" "}
            <span
              className={`font-bold ${
                totalUnrealizedPnL > 0
                  ? "text-green-400"
                  : totalUnrealizedPnL < 0
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              $
              {totalUnrealizedPnL.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>

          <div className="mb-6">
            <div className="text-lg font-semibold mb-1">Native SOL Balance</div>

            <div className="flex items-center gap-4">
              <span className="text-white/90 text-lg font-mono">
                {nativeSol ?? "-"} SOL
              </span>

              {nativeSolUsd !== null && (
                <span className="text-white/60 text-base">
                  ($
                  {nativeSolUsd.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  USD)
                </span>
              )}
            </div>
          </div>

          <div className="text-lg font-semibold mb-2">Tokens</div>

          <div className="space-y-3">
            {filteredTokens.map((token, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {token.logo && (
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                  )}

                  <div>
                    <div className="font-semibold">{token.symbol}</div>

                    <div className="text-sm text-white/60">{token.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono">
                    {Number(token.amount).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </div>

                  <div className="text-sm text-white/60">
                    $
                    {token.price
                      ? (
                          Number(token.price) * Number(token.amount)
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })
                      : "-"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {portfolio && Object.keys(tokenAllocations).length > 0 && (
        <div className="mt-8 w-full max-w-6xl bg-[#18181b] rounded-lg p-6 text-white/90">
          <div className="text-xl font-bold mb-6">Portfolio Allocation</div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Pie Chart */}

            <div className="flex-1 flex justify-center">
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
                        background: "rgba(20, 20, 30, 0.9)",

                        border: "1px solid rgba(255, 255, 255, 0.2)",

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

            {/* Legend */}

            <div className="flex-1">
              <div className="space-y-3">
                {pieChartData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>

                      <span className="font-semibold">{item.name}</span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold">{item.value}%</div>

                      <div className="text-sm text-white/60">
                        $
                        {item.usdValue.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {Object.keys(tokenPnL).length > 0 && (
        <div className="mt-8 w-full max-w-6xl bg-[#18181b] rounded-lg p-6 text-white/90">
          <div className="text-xl font-bold mb-4">PnL by Token</div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-white/60">
                <tr>
                  <th className="p-2 text-left">Token</th>

                  <th className="p-2 text-right">Allocation (%)</th>

                  <th className="p-2 text-right">PnL (USD)</th>

                  <th className="p-2 text-right">Unrealized PnL (USD)</th>

                  <th className="p-2 text-right">Avg Entry Price</th>

                  <th className="p-2 text-right">Sold Avg Price</th>

                  <th className="p-2 text-right">Total Buys (USD)</th>

                  <th className="p-2 text-right">Total Sells (USD)</th>
                </tr>
              </thead>

              <tbody>
                {Object.entries(tokenPnL).map(([symbol, stats]) => (
                  <tr key={symbol} className="border-t border-white/10">
                    <td className="p-2 font-semibold">{symbol}</td>

                    <td className="p-2 text-right">
                      {tokenAllocations[symbol]
                        ? `${tokenAllocations[symbol].percentage.toFixed(1)}%`
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
                      {stats.totalBuy.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>

                    <td className="p-2 text-right">
                      {stats.totalSell.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
