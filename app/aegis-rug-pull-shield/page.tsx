"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  AlertTriangle,
  Search,
  SquareArrowOutUpRight,
  Coins,
  TrendingUp,
  PieChart as LucidePieChart, // Add this import
} from "lucide-react";

const DEFAULT_TOKEN = "ArpNuJM43As8iYMPKNJwAf2YAcxfusJ7uasp7eHXpump";
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
const OTHERS_COLOR = "#6c757d";

export default function AegisRugPullShield() {
  const [tokenAddress, setTokenAddress] = useState(DEFAULT_TOKEN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [holders, setHolders] = useState<any[]>([]);
  const [totalSupply, setTotalSupply] = useState<string>("");
  const [price, setPrice] = useState<number | null>(null);
  const [mcap, setMcap] = useState<number | null>(null);
  const [liquidityPools, setLiquidityPools] = useState<any[]>([]);
  const [rugcheck, setRugcheck] = useState<any | null>(null);
  const [rugcheckSummary, setRugcheckSummary] = useState<any | null>(null);
  const [walletInput, setWalletInput] = useState("");

  const fetchTopHolders = async (addressOverride?: string) => {
    setLoading(true);
    setError("");
    setHolders([]);
    setTotalSupply("");
    setPrice(null);
    setMcap(null);
    setLiquidityPools([]);
    setRugcheck(null);
    setRugcheckSummary(null);
    try {
      const res = await fetch("/api/rugpull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress: addressOverride || tokenAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch data");
      setHolders(data.holders || []);
      setTotalSupply(data.totalSupply || "");
      setPrice(data.price ?? null);
      setMcap(data.mcap ?? null);
      setLiquidityPools(data.liquidityPools || []);
      setRugcheck(data.rugcheck || null);
      setRugcheckSummary(data.rugcheckSummary || null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  let pieData: { name: string; value: number; address?: string }[] = [];
  let top10CombinedPct = 0;
  if (holders.length > 0) {
    let top11Sum = 0;
    holders.slice(0, 11).forEach((holder, idx) => {
      const pct = Number(holder.percentageRelativeToTotalSupply);
      top11Sum += pct;
      pieData.push({
        name:
          idx === 0
            ? "Liquidity Pool"
            : holder.ownerAddress.slice(0, 4) +
              "..." +
              holder.ownerAddress.slice(-4),
        value: Number(pct.toFixed(2)),
        address: holder.ownerAddress,
      });
    });
    top10CombinedPct = holders
      .slice(1, 11)
      .reduce(
        (sum, holder) => sum + Number(holder.percentageRelativeToTotalSupply),
        0
      );
    const othersValue = Number((100 - top11Sum).toFixed(2));
    if (othersValue > 0) {
      pieData.push({ name: "Others", value: othersValue });
    }
  }

  // Calculate top 10 holders percentage (excluding LP)
  const top10Pct =
    holders.length > 1
      ? holders
          .slice(1, 11)
          .reduce(
            (sum, h) => sum + Number(h.percentageRelativeToTotalSupply),
            0
          )
      : 0;

  return (
    <div className="min-h-screen bg-[#10101a] text-white font-sans flex flex-col items-center pt-16 sm:pt-24 pb-6 sm:pb-10 relative overflow-hidden">
      <div className="absolute inset-0 flex justify-center items-center blur-[120px] md:blur-[180px] z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[1000px] opacity-80 md:opacity-5 [background-image:conic-gradient(from_180deg_at_50%_50%,#0aefff_0deg,#0f83ff_60deg,#4f46e5_120deg,#a84ddf_180deg,#00ffb8_240deg,#00cfff_300deg,#6a5acd_360deg)]"></div>
      </div>
      <div className="w-full max-w-[95%] sm:max-w-[90%] mx-auto flex flex-col gap-3 sm:gap-2 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2 rounded-lg pt-10 sm:pt-4 pb-2 sm:pb-4">
          <input
            type="text"
            className="w-full px-4 py-3 sm:py-2 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Enter wallet or token address..."
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            disabled={loading}
          />
          <button
            className="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 sm:py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
            onClick={() => {
              if (walletInput) {
                setTokenAddress(walletInput);
                fetchTopHolders(walletInput);
              } else {
                fetchTopHolders();
              }
            }}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        {/* Risk Score and Token Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-3 sm:gap-2">
          <div className="p-4 sm:p-8 sm:px-10 flex flex-col gap-2 rounded-lg bg-gray-900/60 backdrop-blur-lg border border-white/20 items-center justify-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Risk Score
              </h1>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-yellow-400 text-center">
              {rugcheckSummary?.score_normalised}
            </h1>
            <p className="text-gray-400 text-xs sm:text-base text-center px-2">
              The risk score is a measure of the risk of the token being a rug
            </p>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-lg border border-white/20 p-4 sm:p-8 sm:px-10 flex flex-col lg:flex-row gap-4 lg:gap-8 rounded-lg">
            <div className="flex flex-col gap-2 items-center justify-center w-full lg:w-1/3">
              <img
                src={rugcheck?.fileMeta?.image}
                alt={rugcheck?.fileMeta?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-gray-700 bg-gray-800 object-cover"
              />
              <h1 className="text-white text-lg sm:text-2xl font-bold text-center mt-2">
                {rugcheck?.fileMeta?.name}
              </h1>
              <span className="text-gray-400 text-sm sm:text-lg text-center font-semibold">
                ({rugcheck?.fileMeta?.symbol})
              </span>
            </div>
            <div className="flex flex-col gap-2 w-full lg:w-2/3 justify-center">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-bold text-blue-400 text-sm sm:text-base">
                  Creator:
                </span>
                <div className="flex items-center gap-1">
                  {rugcheck?.creator ? (
                    <>
                      <a
                        href={`https://solscan.io/account/${rugcheck.creator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 font-mono text-xs hover:text-blue-400 hover:underline cursor-pointer break-all"
                      >
                        {rugcheck.creator}
                      </a>
                      <a
                        href={`https://dexscreener.com/solana/${rugcheck.creator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <SquareArrowOutUpRight
                          size={16}
                          className="text-gray-400 hover:text-blue-400"
                        />
                      </a>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-bold text-blue-400 text-sm sm:text-base">
                  Mint:
                </span>
                <div className="flex items-center gap-1">
                  {rugcheck?.mint ? (
                    <>
                      <a
                        href={`https://solscan.io/account/${rugcheck.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 font-mono text-xs hover:text-blue-400 hover:underline cursor-pointer break-all"
                      >
                        {rugcheck.mint}
                      </a>
                      <a
                        href={`https://dexscreener.com/solana/${rugcheck.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <SquareArrowOutUpRight
                          size={16}
                          className="text-gray-400 hover:text-blue-400"
                        />
                      </a>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-bold text-yellow-400 text-sm sm:text-base">
                  Supply:
                </span>
                <span className="text-gray-400 text-sm sm:text-base break-all">
                  {totalSupply || "-"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-bold text-green-400 text-sm sm:text-base">
                  Market Cap:
                </span>
                <span className="text-gray-400 text-sm sm:text-base">
                  ${mcap || "-"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-bold text-purple-400 text-sm sm:text-base">
                  Creator Balance:
                </span>
                <span className="text-gray-400 text-sm sm:text-base">
                  {rugcheck?.creatorBalance !== undefined
                    ? rugcheck?.creatorBalance.toLocaleString()
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* AI Risk Analysis Card */}
        <div className="bg-gray-900/60 backdrop-blur-lg border border-white/20 p-4 sm:p-8 sm:px-10 flex flex-col gap-2 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              AI Risk Analysis
            </h1>
          </div>
          {rugcheck && rugcheck.risks && rugcheck.risks.length > 0 ? (
            <ul className="space-y-2 sm:space-y-1 text-sm sm:text-base list-disc list-inside text-yellow-200/80 text-left sm:text-center">
              {rugcheck.risks.map((risk: any, idx: number) => (
                <li key={idx} className="break-words">
                  <span className="font-bold">{risk.name}</span> ({risk.level}
                  ): {risk.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-green-400 font-semibold text-base sm:text-lg">
              All Good ✅
            </p>
          )}
        </div>

        {/* Token Distribution & Liquidity Pools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-2 h-full">
          {/* Token Distribution Card */}
          <div className="bg-gray-900/60 backdrop-blur-lg border border-white/20 p-4 sm:p-8 sm:px-10 flex flex-col gap-2 rounded-lg items-center">
            <div className="flex items-center gap-2 mb-2">
              <LucidePieChart className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Token Distribution
              </h1>
            </div>
            <div className="relative w-full h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    labelLine={false}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={
                          entry.name === "Others"
                            ? OTHERS_COLOR
                            : COLORS[idx % COLORS.length]
                        }
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
                    formatter={(value: any, name: any) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-gray-400 text-xs sm:text-sm">
                  Top 10 %
                </span>
                <span className="text-white font-bold text-xl sm:text-2xl">
                  {top10Pct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          {/* Liquidity Pools Card */}
          <div className="bg-gray-900/60 backdrop-blur-lg border border-white/20 p-4 sm:p-8 sm:px-10 flex flex-col gap-2 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Liquidity Pools
              </h1>
            </div>
            <div className="flex flex-col gap-3 w-full mt-2">
              {liquidityPools.length > 0 ? (
                liquidityPools.map((lp, idx) => (
                  <div
                    key={lp.pairAddress}
                    className="bg-gray-800/60 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      {lp.exchangeLogo && (
                        <img
                          src={lp.exchangeLogo}
                          alt={lp.exchangeName}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-white font-semibold text-sm sm:text-base">
                          {lp.exchangeName}
                        </span>
                        <span className="text-gray-400 text-xs sm:text-sm">
                          {lp.pairLabel}
                        </span>
                      </div>
                    </div>
                    <div className="text-white font-bold text-sm sm:text-base">
                      $
                      {Number(lp.liquidityUsd).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 text-sm sm:text-base">
                  No liquidity pools found.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top 10 Holders Distribution Table */}
        <div className="grid grid-cols-1 gap-4 h-full">
          <div className="bg-gray-900/60 backdrop-blur-lg border border-white/20 p-4 sm:p-8 sm:px-10 flex flex-col gap-2 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Top 10 Holders Distribution
              </h1>
            </div>
            <div className="overflow-x-auto w-full h-full mt-2">
              <table className="w-full text-xs sm:text-sm text-left min-w-[600px]">
                <thead className="text-white/60">
                  <tr>
                    <th className="p-2 sm:p-3 font-semibold">Rank</th>
                    <th className="p-2 sm:p-3 font-semibold">Address</th>
                    <th className="p-2 sm:p-3 font-semibold text-right">
                      Balance
                    </th>
                    <th className="p-2 sm:p-3 font-semibold text-right">
                      % of Supply
                    </th>
                    <th className="p-2 sm:p-3 font-semibold text-right">
                      USD Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* LP row at the top, no number */}
                  {holders[0] && (
                    <tr
                      key={holders[0].ownerAddress}
                      className="border-t border-white/10 hover:bg-gray-800/60"
                    >
                      <td className="p-2 sm:p-3"></td>
                      <td className="p-2 sm:p-3">
                        <a
                          href={`https://solscan.io/account/${holders[0].ownerAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-blue-300 hover:text-blue-400 hover:underline break-all"
                        >
                          Liquidity Pool
                        </a>
                      </td>
                      <td className="p-2 sm:p-3 text-right text-white font-medium text-xs sm:text-sm">
                        {parseInt(holders[0].balanceFormatted).toLocaleString()}
                      </td>
                      <td className="p-2 sm:p-3 text-right text-white/80 text-xs sm:text-sm">
                        {holders[0].percentageRelativeToTotalSupply}%
                      </td>
                      <td className="p-2 sm:p-3 text-right text-white font-bold text-xs sm:text-sm">
                        $
                        {Number(holders[0].usdValue).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  )}
                  {/* Top 10 non-LP holders, numbered 1-10 */}
                  {holders.length > 1 &&
                    holders.slice(1, 11).map((holder, idx) => (
                      <tr
                        key={holder.ownerAddress}
                        className="border-t border-white/10 hover:bg-gray-800/60"
                      >
                        <td className="p-2 sm:p-3">
                          <span className="font-bold text-white text-xs sm:text-sm">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3">
                          <a
                            href={`https://solscan.io/account/${holder.ownerAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-300 hover:text-blue-400 hover:underline break-all"
                          >
                            {holder.ownerAddress}
                          </a>
                        </td>
                        <td className="p-2 sm:p-3 text-right text-white font-medium text-xs sm:text-sm">
                          {parseInt(holder.balanceFormatted).toLocaleString()}
                        </td>
                        <td className="p-2 sm:p-3 text-right text-white/80 text-xs sm:text-sm">
                          {holder.percentageRelativeToTotalSupply}%
                        </td>
                        <td className="p-2 sm:p-3 text-right text-white font-bold text-xs sm:text-sm">
                          $
                          {Number(holder.usdValue).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
