import { NextRequest, NextResponse } from "next/server";

/**
 *
 * @param req
 */
export async function POST(req: NextRequest) {
  try {
    const { tokenAddress } = await req.json();
    if (!tokenAddress) {
      return NextResponse.json({ error: "Missing token address" }, { status: 400 });
    }
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Moralis API key" }, { status: 500 });
    }
    // Fetch top holders
    const holdersUrl = `https://solana-gateway.moralis.io/token/mainnet/${tokenAddress}/top-holders?limit=11`;
    const holdersRes = await fetch(holdersUrl, {
      headers: {
        accept: "application/json",
        "X-API-Key": apiKey,
      },
    });
    if (!holdersRes.ok) {
      return NextResponse.json({ error: "Failed to fetch holders from Moralis" }, { status: 500 });
    }
    const holdersData = await holdersRes.json();

    // Fetch price
    const priceUrl = `https://solana-gateway.moralis.io/token/mainnet/${tokenAddress}/price`;
    const priceRes = await fetch(priceUrl, {
      headers: {
        accept: "application/json",
        "X-API-Key": apiKey,
      },
    });
    if (!priceRes.ok) {
      return NextResponse.json({ error: "Failed to fetch price from Moralis" }, { status: 500 });
    }
    const priceData = await priceRes.json();
    const price = priceData.usdPrice;

    // Fetch total supply (formatted)
    const metaUrl = `https://solana-gateway.moralis.io/token/mainnet/${tokenAddress}/metadata`;
    const metaRes = await fetch(metaUrl, {
      headers: {
        accept: "application/json",
        "X-API-Key": apiKey,
      },
    });
    if (!metaRes.ok) {
      return NextResponse.json({ error: "Failed to fetch metadata from Moralis" }, { status: 500 });
    }
    const metaData = await metaRes.json();
    const totalSupply = metaData.totalSupplyFormatted;

    // Fetch all LP pairs for the token
    const pairsUrl = `https://solana-gateway.moralis.io/token/mainnet/${tokenAddress}/pairs`;
    const pairsRes = await fetch(pairsUrl, {
      headers: {
        accept: "application/json",
        "X-API-Key": apiKey,
      },
    });
    if (!pairsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch pairs from Moralis" }, { status: 500 });
    }
    const pairsData = await pairsRes.json();
    const pairs = pairsData.pairs || [];

    // For each pair, fetch its portfolio to get actual reserves
    const liquidityPools = [];
    for (const pair of pairs) {
      const portfolioUrl = `https://solana-gateway.moralis.io/account/mainnet/${pair.pairAddress}/portfolio`;
      const portfolioRes = await fetch(portfolioUrl, {
        headers: {
          accept: "application/json",
          "X-API-Key": apiKey,
        },
      });
      let portfolio = null;
      if (portfolioRes.ok) {
        portfolio = await portfolioRes.json();
      }
      liquidityPools.push({
        exchangeName: pair.exchangeName,
        exchangeLogo: pair.exchangeLogo,
        pairLabel: pair.pairLabel,
        pairAddress: pair.pairAddress,
        liquidityUsd: pair.liquidityUsd,
        usdPrice: pair.usdPrice,
        baseToken: pair.baseToken,
        quoteToken: pair.quoteToken,
        tokens: portfolio ? portfolio.tokens : [],
        nativeBalance: portfolio ? portfolio.nativeBalance : null,
      });
    }

    // Fetch RugCheck report
    let rugcheck = null;
    try {
      const rugcheckUrl = `https://api.rugcheck.xyz/v1/tokens/${tokenAddress}/report`;
      const rugcheckRes = await fetch(rugcheckUrl);
      if (rugcheckRes.ok) {
        rugcheck = await rugcheckRes.json();
      }
    } catch (e) {
      // Ignore rugcheck errors
    }

    // Fetch RugCheck summary report
    let rugcheckSummary = null;
    try {
      const summaryUrl = `https://api.rugcheck.xyz/v1/tokens/${tokenAddress}/report/summary`;
      const summaryRes = await fetch(summaryUrl);
      if (summaryRes.ok) {
        rugcheckSummary = await summaryRes.json();
      }
    } catch (e) {
      // Ignore summary errors
    }

    // Calculate mcap
    let mcap = null;
    if (price && totalSupply) {
      mcap = Number(price) * Number(totalSupply);
    }

    return NextResponse.json({
      holders: holdersData.result,
      totalSupply,
      price,
      mcap,
      liquidityPools,
      rugcheck,
      rugcheckSummary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
} 