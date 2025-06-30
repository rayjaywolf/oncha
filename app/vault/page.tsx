"use client";

import React, { useState } from "react";

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

export default function VaultPage() {
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [portfolio, setPortfolio] = useState<{
    nativeBalance?: { solana: string };
    tokens?: any[];
    totalSwaps?: number;
    swaps?: any[];
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
            {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
                    maximumFractionDigits: 2,
                  })}{" "}
                  USD)
                </span>
              )}
            </div>
          </div>
          <div className="text-lg font-semibold mb-2">Tokens</div>
          <ul className="space-y-2">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <li key={token.mint} className="flex items-center gap-3">
                  {token.logo && (
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium">
                    {token.symbol || token.name}
                  </span>
                  <span className="ml-auto">
                    {Number(token.amount).toLocaleString()} {token.symbol}
                  </span>
                  {typeof token.valueUsd === "number" && (
                    <span className="ml-4 text-white/60">
                      $
                      {token.valueUsd.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </li>
              ))
            ) : (
              <li className="text-white/60">No tokens found.</li>
            )}
          </ul>
        </div>
      )}
      {portfolio && portfolio.swaps && portfolio.swaps.length > 0 && (
        <div className="mt-8 w-full max-w-2xl bg-[#18181b] rounded-lg p-6 text-white/90">
          <div className="text-xl font-bold mb-4">
            Recent Swaps / Transactions
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-white/60">
                <tr>
                  <th className="p-2 font-semibold">Date</th>
                  <th className="p-2 font-semibold">Type</th>
                  <th className="p-2 font-semibold">Pair</th>
                  <th className="p-2 font-semibold">Exchange</th>
                  <th className="p-2 font-semibold">Bought</th>
                  <th className="p-2 font-semibold">Sold</th>
                  <th className="p-2 font-semibold text-right">USD Value</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.swaps.map((tx, idx) => (
                  <tr
                    key={
                      tx.transactionHash + "-" + tx.blockTimestamp + "-" + idx
                    }
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="p-2 whitespace-nowrap">
                      {new Date(tx.blockTimestamp).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-white/50">
                        {new Date(tx.blockTimestamp).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="p-2 capitalize">{tx.transactionType}</td>
                    <td className="p-2">{tx.pairLabel}</td>
                    <td className="p-2">{tx.exchangeName}</td>
                    <td className="p-2">
                      {tx.bought?.logo && (
                        <img
                          src={tx.bought.logo}
                          alt={tx.bought.symbol}
                          className="w-5 h-5 inline-block mr-1 align-middle"
                        />
                      )}
                      <span>
                        {tx.bought?.amount
                          ? Number(tx.bought.amount).toLocaleString(undefined, {
                              maximumFractionDigits: 4,
                            })
                          : "-"}{" "}
                        {tx.bought?.symbol}
                      </span>
                    </td>
                    <td className="p-2">
                      {tx.sold?.logo && (
                        <img
                          src={tx.sold.logo}
                          alt={tx.sold.symbol}
                          className="w-5 h-5 inline-block mr-1 align-middle"
                        />
                      )}
                      <span>
                        {tx.sold?.amount
                          ? Number(tx.sold.amount).toLocaleString(undefined, {
                              maximumFractionDigits: 4,
                            })
                          : "-"}{" "}
                        {tx.sold?.symbol}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      $
                      {tx.totalValueUsd
                        ? Number(tx.totalValueUsd).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })
                        : "-"}
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
