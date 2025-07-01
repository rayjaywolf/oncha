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
    // Get current timestamp and 24 hours ago
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

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

    // Calculate 24h change
    let change24h = 0;
    let change24hPercent = 0;

    if (swaps.length > 0) {
      // Get current portfolio value
      let currentValue = 0;
      if (data.nativeBalance) {
        currentValue += Number(data.nativeBalance.solana) * (data.nativeBalance.solanaPrice || 0);
      }
      if (tokensWithPrice.length > 0) {
        for (const token of tokensWithPrice) {
          const tokenValue = token.price ? Number(token.price) * Number(token.amount) : 0;
          currentValue += tokenValue;
        }
      }

      // Calculate net flow in last 24 hours (money in - money out)
      let netFlow24h = 0;
      const swaps24h = swaps.filter(swap => {
        const swapTime = new Date(swap.blockTimestamp);
        return swapTime >= twentyFourHoursAgo;
      });

      for (const swap of swaps24h) {
        if (swap.transactionType === 'buy') {
          // Money going out (negative for net flow calculation)
          netFlow24h -= swap.totalValueUsd || 0;
        } else if (swap.transactionType === 'sell') {
          // Money coming in (positive for net flow calculation)
          netFlow24h += swap.totalValueUsd || 0;
        }
      }

      // Portfolio value 24h ago = current value - net flow in last 24h
      const portfolioValue24hAgo = currentValue - netFlow24h;
      
      // Calculate change
      change24h = currentValue - portfolioValue24hAgo;
      change24hPercent = portfolioValue24hAgo > 0 ? (change24h / portfolioValue24hAgo) * 100 : 0;
    }

    return NextResponse.json({
      nativeBalance: data.nativeBalance,
      tokens: tokensWithPrice,
      totalSwaps,
      swaps,
      change24h: {
        absolute: change24h,
        percentage: change24hPercent,
        timestamp: now.toISOString(),
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
} 