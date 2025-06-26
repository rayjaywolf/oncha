import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { tokenAddress } = await req.json();
    console.log('Token address received:', tokenAddress);
    const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
    console.log('MORALIS_API_KEY present:', !!MORALIS_API_KEY);
    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address is required' }, { status: 400 });
    }
    if (!MORALIS_API_KEY) {
      return NextResponse.json({ error: 'Moralis API key not set' }, { status: 500 });
    }

    // Helper to fetch from Moralis Solana API (correct base URL)
    async function moralisFetch(endpoint: string, params: Record<string, any> = {}) {
      const url = new URL(`https://solana-gateway.moralis.io/${endpoint}`);
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
      const res = await fetch(url.toString(), {
        headers: new Headers({ 'X-API-Key': MORALIS_API_KEY as string }),
      });
      if (res.status === 404) {
        throw new Error('Token not found on Solana or not indexed by Moralis.');
      }
      if (!res.ok) throw new Error(`Moralis API error: ${res.statusText}`);
      return res.json();
    }

    // 1. On-Chain Token & Contract Analysis
    // Get mint info
    const mintInfo = await moralisFetch(`token/mainnet/${tokenAddress}`);
    // 2. Token Holder Analysis
    const holdersInfo = await moralisFetch(`token/mainnet/${tokenAddress}/holders`, { limit: '20' });
    // 3. Token Metadata
    const metadata = await moralisFetch(`token/mainnet/${tokenAddress}/metadata`);

    // 4. Liquidity Analysis (Raydium) - Not directly available, so skip or mock for now
    let liquidityInfo = null;
    // You may need to use a different API or service for Raydium LP info on Solana

    // --- Scoring ---
    let score = 100;
    const details: string[] = [];

    // Mint Authority
    if (mintInfo.mintAuthority) {
      score -= 50;
      details.push('Mint authority is active (not renounced)');
    } else {
      details.push('Mint authority is renounced');
    }
    // Freeze Authority
    if (mintInfo.freezeAuthority) {
      score -= 50;
      details.push('Freeze authority is active (not renounced)');
    } else {
      details.push('Freeze authority is renounced');
    }
    // Top Holder Distribution
    const topHolders = holdersInfo.result || holdersInfo.holders || [];
    const totalSupply = Number(mintInfo.supply || 0);
    const top10 = topHolders.slice(0, 10);
    const top10Sum = top10.reduce((sum: number, h: any) => sum + Number(h.amount), 0);
    if (totalSupply > 0 && top10Sum / totalSupply > 0.5) {
      score -= 25;
      details.push('Top 10 wallets hold more than 50% of supply');
    }
    // Creator/Deployer's Token Share
    const creator = mintInfo.mintAuthority || mintInfo.authority || null;
    if (creator) {
      const creatorHolder = topHolders.find((h: any) => h.address === creator);
      if (creatorHolder && totalSupply > 0 && Number(creatorHolder.amount) / totalSupply > 0.15) {
        score -= 30;
        details.push('Creator holds more than 15% of supply');
      }
    }
    // Total Number of Holders
    const holderCount = holdersInfo.total || holdersInfo.result?.length || holdersInfo.holders?.length || 0;
    if (holderCount < 100) {
      score -= 10;
      details.push('Low total holders (<100)');
    }
    // LP Tokens (Raydium) - Not available, so skip
    details.push('Raydium LP info not available via Moralis Solana API');

    // Clamp score
    if (score < 0) score = 0;
    // Risk Level
    let riskLevel = '✅ Low Risk';
    if (score < 60) riskLevel = '🚨 High Risk / Potential Rug Pull';
    else if (score < 85) riskLevel = '⚠️ Medium Risk';

    // Summary
    const summary = `This token was analyzed for rug-pull risk based on on-chain contract, holder, and metadata. See details below.`;

    return NextResponse.json({
      score,
      riskLevel,
      summary,
      details,
      mintInfo,
      holdersInfo,
      metadata,
      liquidityInfo,
    });
  } catch (e: any) {
    console.error('Rugpull API error:', e);
    if (e.message && e.message.includes('Token not found')) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
} 