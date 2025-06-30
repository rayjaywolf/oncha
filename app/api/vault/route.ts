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
    // Fetch swaps/transactions (fetch all pages with rate limiting)
    let totalSwaps = 0;
    let swaps = [];
    let cursor = null;
    let page = 1;
    const pageSize = 100;
    while (true) {
      let swapsUrl = `https://solana-gateway.moralis.io/account/mainnet/${address}/swaps?pageSize=${pageSize}`;
      if (cursor) swapsUrl += `&cursor=${encodeURIComponent(cursor)}`;
      const swapsRes = await fetch(swapsUrl, {
        headers: {
          accept: "application/json",
          "X-API-Key": apiKey,
        },
      });
      if (!swapsRes.ok) break;
      const swapsData = await swapsRes.json();
      if (Array.isArray(swapsData.result)) {
        swaps.push(...swapsData.result.map((tx: any) => ({
          transactionHash: tx.transactionHash,
          transactionType: tx.transactionType,
          blockTimestamp: tx.blockTimestamp,
          pairLabel: tx.pairLabel,
          exchangeName: tx.exchangeName,
          bought: tx.bought,
          sold: tx.sold,
          totalValueUsd: tx.totalValueUsd,
        })));
      }
      if (!swapsData.cursor) break;
      cursor = swapsData.cursor;
      page++;
      // Rate limit: wait 300ms between requests
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    totalSwaps = swaps.length;
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