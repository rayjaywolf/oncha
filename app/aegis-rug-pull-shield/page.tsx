"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DEFAULT_TOKEN = "ArpNuJM43As8iYMPKNJwAf2YAcxfusJ7uasp7eHXpump";
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28BFE",
  "#FF6699",
  "#FFB347",
  "#B6E880",
  "#FF6F61",
  "#6EC6FF",
  "#8884d8",
];
const OTHERS_COLOR = "#888888";

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

  const fetchTopHolders = async () => {
    setLoading(true);
    setError("");
    setHolders([]);
    setTotalSupply("");
    setPrice(null);
    setMcap(null);
    setLiquidityPools([]);
    setRugcheck(null);
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
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Prepare pie chart data: group <1% as 'Others'
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
            ? "LP"
            : holder.ownerAddress.slice(0, 6) +
              "..." +
              holder.ownerAddress.slice(-4),
        value: Number(pct.toFixed(2)),
        address: holder.ownerAddress,
      });
    });
    // Calculate top 10 holders combined (excluding LP)
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

  return (
    <div className="min-h-screen bg-[#01010e] flex flex-col items-center py-16 pt-28">
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">
        Aegis Rug-Pull Shield
      </h1>
      <div className="flex gap-2 mb-8">
        <input
          className="px-4 py-2 rounded-md border border-gray-700 bg-[#181828] text-white w-96"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="Enter Solana token address"
        />
        <button
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          onClick={fetchTopHolders}
          disabled={loading}
        >
          {loading ? "Loading..." : "Check Distribution"}
        </button>
      </div>
      {error && <div className="text-red-400 mb-4">{error}</div>}
      {pieData.length > 0 && (
        <div className="w-full max-w-2xl mb-8 bg-[#181828] rounded-lg p-4 flex flex-col items-center">
          <h2 className="text-white text-lg mb-2">
            Token Distribution (Top 10 Holders + Others)
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ value }) => `${value}%`}
              >
                {pieData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={
                      entry.name === "Others"
                        ? OTHERS_COLOR
                        : COLORS[idx % COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-white mt-4">
            Combined % of Top 10 Holders (Excluding LP):{" "}
            <span className="font-bold">{top10CombinedPct.toFixed(2)}%</span>
          </div>
        </div>
      )}
      {holders.length > 0 && (
        <div className="w-full max-w-3xl overflow-x-auto">
          <div className="text-white mb-2 flex flex-wrap gap-6 items-center">
            <span>Total Supply: {totalSupply}</span>
            {price !== null && (
              <span>
                Current Price:{" "}
                <span className="font-bold">
                  $
                  {price.toLocaleString(undefined, {
                    maximumFractionDigits: 8,
                  })}
                </span>
              </span>
            )}
            {mcap !== null && (
              <span>
                Market Cap:{" "}
                <span className="font-bold">
                  $
                  {mcap.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </span>
            )}
          </div>
          {rugcheck && (
            <div className="mb-6 bg-[#181828] rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                {rugcheck.fileMeta?.image && (
                  <img
                    src={rugcheck.fileMeta.image}
                    alt={rugcheck.fileMeta.name}
                    className="w-16 h-16 rounded-md"
                  />
                )}
                <div>
                  <h2 className="text-white text-xl font-bold mb-1">
                    {rugcheck.fileMeta?.name}{" "}
                    <span className="text-white/60 text-lg">
                      ({rugcheck.fileMeta?.symbol})
                    </span>
                  </h2>
                  <div className="text-white/80 text-sm mb-1">
                    {rugcheck.fileMeta?.description}
                  </div>
                  <div className="text-white/60 text-xs">
                    Mint: {rugcheck.mint}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 mb-2 text-white/80 text-sm">
                <span>
                  Score:{" "}
                  <span className="font-bold">
                    {rugcheck.score_normalised ?? rugcheck.score}
                  </span>
                </span>
                <span>
                  Rugged:{" "}
                  <span
                    className={
                      rugcheck.rugged
                        ? "text-red-400 font-bold"
                        : "text-green-400 font-bold"
                    }
                  >
                    {rugcheck.rugged ? "Yes" : "No"}
                  </span>
                </span>
                <span>
                  Creator: <span className="font-mono">{rugcheck.creator}</span>
                </span>
                <span>
                  Freeze Authority:{" "}
                  <span className="font-mono">{rugcheck.freezeAuthority}</span>
                </span>
                <span>
                  Total Holders:{" "}
                  <span className="font-bold">{rugcheck.totalHolders}</span>
                </span>
                <span>
                  Total LP Providers:{" "}
                  <span className="font-bold">{rugcheck.totalLPProviders}</span>
                </span>
                <span>
                  Total Market Liquidity:{" "}
                  <span className="font-bold">
                    ${rugcheck.totalMarketLiquidity?.toLocaleString()}
                  </span>
                </span>
              </div>
              {rugcheck.risks && rugcheck.risks.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-white text-md font-semibold mb-1">
                    Risks
                  </h3>
                  <ul className="list-disc ml-6 text-yellow-300 text-sm">
                    {rugcheck.risks.map((risk: any, idx: number) => (
                      <li key={idx}>
                        <span className="font-bold">{risk.name}</span> (
                        {risk.level}): {risk.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {rugcheck.topHolders && rugcheck.topHolders.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-white text-md font-semibold mb-1">
                    Top Holders
                  </h3>
                  <table className="min-w-[300px] text-xs text-white/80">
                    <thead>
                      <tr>
                        <th className="pr-2">Address</th>
                        <th className="pr-2">%</th>
                        <th>Insider</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rugcheck.topHolders
                        .slice(0, 5)
                        .map((h: any, idx: number) => (
                          <tr key={h.address}>
                            <td className="pr-2 font-mono">{h.address}</td>
                            <td className="pr-2">{h.pct}%</td>
                            <td>{h.insider ? "Yes" : "No"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
              {rugcheck.markets && rugcheck.markets.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-white text-md font-semibold mb-1">
                    Markets
                  </h3>
                  <table className="min-w-[300px] text-xs text-white/80">
                    <thead>
                      <tr>
                        <th className="pr-2">Type</th>
                        <th className="pr-2">Liquidity</th>
                        <th className="pr-2">LP Locked %</th>
                        <th>LP Locked USD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rugcheck.markets.map((m: any, idx: number) => (
                        <tr key={m.pubkey}>
                          <td className="pr-2">{m.marketType}</td>
                          <td className="pr-2">
                            {m.liquidityA} / {m.liquidityB}
                          </td>
                          <td className="pr-2">{m.lp?.lpLockedPct}%</td>
                          <td>${m.lp?.lpLockedUSD?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {rugcheck.rugged && (
                <div className="mt-2 text-red-400 font-bold">
                  ⚠️ This token is flagged as rugged!
                </div>
              )}
            </div>
          )}
          {liquidityPools.length > 0 && (
            <div className="mb-6 bg-[#181828] rounded-lg p-4">
              <h2 className="text-white text-lg mb-2">Liquidity Pools</h2>
              <div className="flex flex-col gap-4">
                {liquidityPools.map((lp, idx) => (
                  <div
                    key={lp.pairAddress}
                    className="border border-gray-700 rounded-md p-3 flex flex-col md:flex-row md:items-center md:gap-8 gap-2 bg-[#101018]"
                  >
                    <div className="flex items-center gap-2 mb-2 md:mb-0">
                      {lp.exchangeLogo && (
                        <img
                          src={lp.exchangeLogo}
                          alt={lp.exchangeName}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-white font-semibold">
                        {lp.exchangeName}
                      </span>
                      <span className="text-white/70">{lp.pairLabel}</span>
                    </div>
                    <div className="text-white/80">
                      LP Size:{" "}
                      <span className="font-bold">
                        $
                        {lp.liquidityUsd
                          ? Number(lp.liquidityUsd).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="text-white/60 text-xs">
                      Tokens in Pool:{" "}
                      {lp.tokens && lp.tokens.length > 0
                        ? lp.tokens
                            .map(
                              (t: any) =>
                                `${t.symbol || t.name || t.mint}: ${t.amount}`
                            )
                            .join(", ")
                        : "N/A"}
                    </div>
                  </div>
                ))}
              </div>
              {liquidityPools.some(
                (lp) =>
                  lp.liquidityUsd &&
                  mcap &&
                  lp.liquidityUsd < 10000 &&
                  mcap > 100000
              ) && (
                <div className="mt-4 text-yellow-400 font-semibold">
                  ⚠️ A small liquidity pool relative to the market cap makes the
                  token highly volatile and easy to manipulate. Very low
                  liquidity (e.g., under $10,000) for a token with a high market
                  cap is a major risk factor.
                </div>
              )}
            </div>
          )}
          <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-[#181828] text-white">
              <tr>
                <th className="px-4 py-2 text-left">Rank</th>
                <th className="px-4 py-2 text-left">Address</th>
                <th className="px-4 py-2 text-left">Balance</th>
                <th className="px-4 py-2 text-left">% of Supply</th>
                <th className="px-4 py-2 text-left">USD Value</th>
              </tr>
            </thead>
            <tbody className="bg-[#101018]">
              {holders.slice(0, 11).map((holder, idx) => (
                <tr
                  key={holder.ownerAddress}
                  className="border-t border-gray-700"
                >
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2 font-mono text-xs break-all">
                    {idx === 0 ? "LP" : holder.ownerAddress}
                  </td>
                  <td className="px-4 py-2">{holder.balanceFormatted}</td>
                  <td className="px-4 py-2">
                    {holder.percentageRelativeToTotalSupply}%
                  </td>
                  <td className="px-4 py-2">
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
      )}
    </div>
  );
}
