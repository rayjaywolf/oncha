"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, Search, SquareArrowOutUpRight } from "lucide-react";

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

  const fetchTopHolders = async () => {
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
        body: JSON.stringify({ tokenAddress }),
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
    <div className="h-full bg-[#01010e] text-gray-200 font-sans flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto">
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              className="flex-grow px-5 py-3 rounded-lg border border-gray-700 bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="Enter Solana token address"
            />
            <button
              className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform  flex items-center justify-center gap-2"
              onClick={fetchTopHolders}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Analyze Token
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 text-red-400 bg-red-900/30 p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle size={20} /> {error}
            </div>
          )}
        </div>

        {holders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col gap-8">
              <div className="glass-card p-6">
                <h2 className="text-white text-xl font-bold mb-4 text-center">
                  Token Distribution
                </h2>
                <div className="w-full h-72 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
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
                          background: "rgba(20, 20, 30, 0.8)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "10px",
                        }}
                        itemStyle={{ color: "#eee" }}
                        formatter={(value: any, name: any) => [
                          `${value}%`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-gray-400 text-sm">Top 10 %</span>
                    <span className="text-white font-bold text-2xl">
                      {top10CombinedPct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <h2 className="text-white text-xl font-bold mb-4">
                  Token Info
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Supply</span>
                    <span className="font-mono text-white">{totalSupply}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Price</span>
                    <span className="font-bold text-green-400">
                      $
                      {price?.toLocaleString(undefined, {
                        maximumFractionDigits: 8,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Market Cap</span>
                    <span className="font-bold text-white">
                      $
                      {mcap?.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {rugcheck && (
                <div className="glass-card p-6 h-full">
                  <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                    {rugcheck.fileMeta?.image && (
                      <img
                        src={rugcheck.fileMeta.image}
                        alt={rugcheck.fileMeta.name}
                        className="w-24 h-24 rounded-full border-2 border-gray-600"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-white text-2xl font-bold">
                        {rugcheck.fileMeta?.name}{" "}
                        <span className="text-gray-400 text-xl">
                          ({rugcheck.fileMeta?.symbol})
                        </span>
                      </h2>
                      <p className="text-gray-300 mt-2">
                        {rugcheck.fileMeta?.description}
                      </p>
                      <p className="text-gray-500 text-xs mt-2 font-mono break-all">
                        Mint:{" "}
                        {rugcheck.mint
                          ? `${rugcheck.mint.slice(
                              0,
                              4
                            )}...${rugcheck.mint.slice(-4)}`
                          : ""}
                      </p>
                      {rugcheck.creator && (
                        <p className="text-gray-500 text-xs mt-1 font-mono break-all">
                          Creator:{" "}
                          {`${rugcheck.creator.slice(
                            0,
                            4
                          )}...${rugcheck.creator.slice(-4)}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {rugcheck.risks && rugcheck.risks.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-yellow-400 text-lg font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle size={20} /> Potential Risks
                      </h3>
                      <ul className="space-y-1 text-sm list-disc list-inside text-yellow-200/80">
                        {rugcheck.risks.map((risk: any, idx: number) => (
                          <li key={idx}>
                            <span className="font-bold">{risk.name}</span> (
                            {risk.level}): {risk.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {liquidityPools.length > 0 && (
                    <div>
                      <h3 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
                        Liquidity Pools
                      </h3>
                      <div className="flex flex-col gap-3">
                        {liquidityPools.map((lp, idx) => (
                          <div
                            key={lp.pairAddress}
                            className="bg-gray-900/60 p-3 rounded-lg flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              {lp.exchangeLogo && (
                                <img
                                  src={lp.exchangeLogo}
                                  alt={lp.exchangeName}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <div>
                                <span className="text-white font-semibold">
                                  {lp.exchangeName}
                                </span>
                                <span className="text-gray-400 ml-2">
                                  {lp.pairLabel}
                                </span>
                              </div>
                            </div>
                            <div className="text-white font-bold">
                              $
                              {Number(lp.liquidityUsd).toLocaleString(
                                undefined,
                                { maximumFractionDigits: 0 }
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {rugcheckSummary && (
                <div className="glass-card p-6 h-full">
                  <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} /> RugCheck Summary
                  </h2>
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Score:</span>
                      <span className="ml-2 text-white font-bold">
                        {rugcheckSummary.score}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Normalized Score:</span>
                      <span className="ml-2 text-white font-bold">
                        {rugcheckSummary.score_normalised}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Token Program:</span>
                      <span className="ml-2 text-white font-bold">
                        {rugcheckSummary.tokenProgram}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Token Type:</span>
                      <span className="ml-2 text-white font-bold">
                        {rugcheckSummary.tokenType}
                      </span>
                    </div>
                  </div>
                  {rugcheckSummary.risks &&
                    rugcheckSummary.risks.length > 0 && (
                      <div>
                        <h3 className="text-yellow-400 text-lg font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle size={20} /> Risks
                        </h3>
                        <ul className="space-y-1 text-sm list-disc list-inside text-yellow-200/80">
                          {rugcheckSummary.risks.map(
                            (risk: any, idx: number) => (
                              <li key={idx}>
                                <span className="font-bold">{risk.name}</span> (
                                {risk.level}): {risk.description}{" "}
                                <span className="text-gray-400">
                                  [score: {risk.score}, value: {risk.value}]
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        )}

        {holders.length > 0 && (
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-white text-xl font-bold mb-4">
              Top 10 Holders
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="text-gray-400">
                  <tr>
                    <th className="p-3 font-semibold">Rank</th>
                    <th className="p-3 font-semibold">Address</th>
                    <th className="p-3 font-semibold text-right">Balance</th>
                    <th className="p-3 font-semibold text-right">
                      % of Supply
                    </th>
                    <th className="p-3 font-semibold text-right">USD Value</th>
                  </tr>
                </thead>
                <tbody>
                  {/* LP row at the top, no number */}
                  {holders[0] && (
                    <tr
                      key={holders[0].ownerAddress}
                      className="border-t border-gray-800 hover:bg-gray-900/50"
                    >
                      <td className="p-3"></td>
                      <td className="p-3 font-mono text-xs text-blue-300">
                        Liquidity Pool
                      </td>
                      <td className="p-3 text-right text-white font-medium">
                        {parseInt(holders[0].balanceFormatted).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-white/80">
                        {holders[0].percentageRelativeToTotalSupply}%
                      </td>
                      <td className="p-3 text-right text-white font-bold">
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
                        className="border-t border-gray-800 hover:bg-gray-900/50"
                      >
                        <td className="p-3">
                          <span className="font-bold text-white">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs text-blue-300">
                          {holder.ownerAddress}
                        </td>
                        <td className="p-3 text-right text-white font-medium">
                          {parseInt(holder.balanceFormatted).toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-white/80">
                          {holder.percentageRelativeToTotalSupply}%
                        </td>
                        <td className="p-3 text-right text-white font-bold">
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
        )}
      </div>
      <div className="w-full max-w-5xl mx-auto my-30 flex flex-col gap-4">
        <div className="grid grid-cols-[1fr_2fr] gap-4">
          <div className="flex flex-col items-center justify-center gap-4 bg-gray-900/60 p-8 rounded-lg">
            <h1 className="text-white text-3xl font-bold text-center">
              Risk Score
            </h1>
            <h1 className="text-white text-7xl font-bold text-center">
              {rugcheckSummary?.score_normalised}
            </h1>
            <p className="text-gray-200 text-lg w-3/4 text-center mx-auto">
              The risk score is a measure of the risk of the token being a rug
            </p>
          </div>
          <div className="flex gap-2 bg-gray-900/60 p-8 rounded-lg">
            <div className="flex flex-col gap-4 w-1/2 items-center justify-center">
              <img
                src={rugcheck?.fileMeta?.image}
                alt={rugcheck?.fileMeta?.name}
                className="w-24 h-24 rounded-full border-2 border-gray-600"
              />
              <h1 className="text-white text-3xl font-bold text-center">
                {rugcheck?.fileMeta?.name}
              </h1>
              <span className="text-gray-400 text-xl text-left">
                ({rugcheck?.fileMeta?.symbol})
              </span>
            </div>
            <div className="flex flex-col gap-4 w-1/2 justify-center">
              <h2 className="flex items-center gap-2">
                Creator:{" "}
                <span className="text-gray-400">
                  {`${rugcheck?.creator.slice(
                    0,
                    10
                  )}......${rugcheck?.creator.slice(-10)}`}
                </span>
                <SquareArrowOutUpRight size={16} color="gray" />
              </h2>
              <h2 className="flex items-center gap-2">
                Mint:{" "}
                <span className="text-gray-400">
                  {`${rugcheck?.mint.slice(0, 10)}......${rugcheck?.mint.slice(
                    -10
                  )}`}
                </span>
                <SquareArrowOutUpRight size={16} color="gray" />
              </h2>
              <h2 className="flex items-center gap-2">
                Supply: <span className="text-gray-400">{totalSupply}</span>
              </h2>
              <h2 className="flex items-center gap-2">
                Market Cap: <span className="text-gray-400">${mcap}</span>
              </h2>
              <h2 className="flex items-center gap-2">
                Creator Balance:{" "}
                <span className="text-gray-400">
                  {rugcheck?.creatorBalance.toLocaleString()}
                </span>
              </h2>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[1fr] gap-4 h-full">
          <div className="flex flex-col items-center justify-center gap-4 bg-gray-900/60 p-8 rounded-lg">
            <h1 className="text-white text-3xl font-bold text-center mb-2">
              AI Risk Analysis
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_1fr] gap-4 h-full">
          <div className="flex flex-col items-center justify-center gap-4 bg-gray-900/60 p-8 rounded-lg">
            <h1 className="text-white text-3xl font-bold text-center">
              Top 10 Holders
            </h1>
            <div className="relative w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
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
                      background: "rgba(20, 20, 30, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "10px",
                    }}
                    itemStyle={{ color: "#eee" }}
                    formatter={(value: any, name: any) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-white font-bold text-2xl">
                  {top10Pct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 bg-gray-900/60 p-8 rounded-lg">
            <div className="flex flex-col gap-4 w-full">
              {liquidityPools.length > 0 && (
                <div className="flex flex-col gap-4 items-center justify-center">
                  <h3 className="text-white text-3xl font-semibold mb-4 flex items-center gap-2 text-center">
                    Liquidity Pools
                  </h3>
                  <div className="flex flex-col gap-3 w-full">
                    {liquidityPools.map((lp, idx) => (
                      <div
                        key={lp.pairAddress}
                        className="bg-gray-900/60 p-3 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {lp.exchangeLogo && (
                            <img
                              src={lp.exchangeLogo}
                              alt={lp.exchangeName}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <div>
                            <span className="text-white font-semibold">
                              {lp.exchangeName}
                            </span>
                            <span className="text-gray-400 ml-2">
                              {lp.pairLabel}
                            </span>
                          </div>
                        </div>
                        <div className="text-white font-bold">
                          $
                          {Number(lp.liquidityUsd).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[1fr] gap-4 h-full">
          <div className="flex flex-col items-center justify-center gap-4 bg-gray-900/60 p-8 rounded-lg">
            <h1 className="text-white text-3xl font-bold text-center mb-2">
              Top 10 Holders Distribution
            </h1>
            <div className="overflow-x-auto w-full h-full">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-400">
                  <tr>
                    <th className="p-3 font-semibold">Rank</th>
                    <th className="p-3 font-semibold">Address</th>
                    <th className="p-3 font-semibold text-right">Balance</th>
                    <th className="p-3 font-semibold text-right">
                      % of Supply
                    </th>
                    <th className="p-3 font-semibold text-right">USD Value</th>
                  </tr>
                </thead>
                <tbody>
                  {/* LP row at the top, no number */}
                  {holders[0] && (
                    <tr
                      key={holders[0].ownerAddress}
                      className="border-t border-gray-800 hover:bg-gray-900/50"
                    >
                      <td className="p-3"></td>
                      <td className="p-3 font-mono text-xs text-blue-300">
                        Liquidity Pool
                      </td>
                      <td className="p-3 text-right text-white font-medium">
                        {parseInt(holders[0].balanceFormatted).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-white/80">
                        {holders[0].percentageRelativeToTotalSupply}%
                      </td>
                      <td className="p-3 text-right text-white font-bold">
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
                        className="border-t border-gray-800 hover:bg-gray-900/50"
                      >
                        <td className="p-3">
                          <span className="font-bold text-white">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs text-blue-300">
                          {holder.ownerAddress}
                        </td>
                        <td className="p-3 text-right text-white font-medium">
                          {parseInt(holder.balanceFormatted).toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-white/80">
                          {holder.percentageRelativeToTotalSupply}%
                        </td>
                        <td className="p-3 text-right text-white font-bold">
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
