import { NextRequest, NextResponse } from "next/server";

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
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
} 