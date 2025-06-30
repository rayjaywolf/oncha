import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Moralis API key" }, { status: 500 });
    }
    // Fetch portfolio from Moralis
    const url = `https://solana-gateway.moralis.io/account/mainnet/${address}/portfolio`;
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "X-API-Key": apiKey,
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch portfolio from Moralis" }, { status: 500 });
    }
    const data = await res.json();
    // For each token, fetch its USD price from Moralis
    let tokensWithPrice = [];
    if (Array.isArray(data.tokens)) {
      tokensWithPrice = await Promise.all(
        data.tokens.map(async (token: any) => {
          let price = null;
          try {
            const priceUrl = `https://solana-gateway.moralis.io/token/mainnet/${token.mint}/price`;
            const priceRes = await fetch(priceUrl, {
              headers: {
                accept: "application/json",
                "X-API-Key": apiKey,
              },
            });
            if (priceRes.ok) {
              const priceData = await priceRes.json();
              price = priceData.usdPrice ? Number(priceData.usdPrice) : null;
            }
          } catch {}
          return { ...token, price };
        })
      );
    }
    // Fetch swaps/transactions (rate limit: only first page)
    let totalSwaps = 0;
    let swaps = [];
    try {
      const swapsUrl = `https://solana-gateway.moralis.io/account/mainnet/${address}/swaps?pageSize=100`;
      const swapsRes = await fetch(swapsUrl, {
        headers: {
          accept: "application/json",
          "X-API-Key": apiKey,
        },
      });
      if (swapsRes.ok) {
        const swapsData = await swapsRes.json();
        totalSwaps = Array.isArray(swapsData.result) ? swapsData.result.length : 0;
        // Only include relevant fields for each swap
        if (Array.isArray(swapsData.result)) {
          swaps = swapsData.result.map((tx: any) => ({
            transactionHash: tx.transactionHash,
            transactionType: tx.transactionType,
            blockTimestamp: tx.blockTimestamp,
            pairLabel: tx.pairLabel,
            exchangeName: tx.exchangeName,
            bought: tx.bought,
            sold: tx.sold,
            totalValueUsd: tx.totalValueUsd,
          }));
        }
      }
    } catch {}
    return NextResponse.json({
      nativeBalance: data.nativeBalance,
      tokens: tokensWithPrice,
      totalSwaps,
      swaps,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
} 