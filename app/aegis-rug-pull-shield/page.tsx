"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AegisRugPullShieldPage() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/rugpull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress }),
      });
      if (!res.ok) throw new Error("Failed to fetch analysis");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#01010e] flex flex-col items-center py-16 pt-40">
      <h1 className="text-4xl font-bold text-white mb-4">
        Aegis Rug-Pull Shield
      </h1>
      <p className="text-white/80 mb-8 max-w-xl text-center">
        Enter a Solana token address to analyze its rug-pull risk using on-chain
        and liquidity data.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-4 mb-8 w-full max-w-md">
        <Input
          type="text"
          placeholder="Solana Token Address"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          className="flex-1"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Check"}
        </Button>
      </form>
      {error && <div className="text-red-400 mb-4">{error}</div>}
      {result && (
        <Card className="w-full max-w-2xl p-6 bg-[#181825] text-white">
          <h2 className="text-2xl font-bold mb-2">
            Risk Score: {result.score} / 100
          </h2>
          <div className="mb-2">
            <span className="font-semibold">Risk Level:</span>{" "}
            {result.riskLevel}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Summary:</span> {result.summary}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Details:</span>
            <ul className="list-disc ml-6">
              {result.details?.map((d: string, i: number) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
