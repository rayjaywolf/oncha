import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import axios from "axios";
import axiosRetry from "axios-retry";
import { trackCoinSearch } from "@/lib/coins";
import { z } from "zod";

// --- Constants ---
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const DEXSCREENER_API_BASE = "https://api.dexscreener.com/latest/dex";
const GOOGLE_SEARCH_URL = "https://www.googleapis.com/customsearch/v1";
const COINGECKO_REGEX =
  /https?:\/\/(?:www\.)?coingecko\.com\/en\/coins\/([a-zA-Z0-9-]+)/;
const DEXSCREENER_URL_REGEX =
  /dexscreener\.com\/([^\/]+)\/([a-zA-Z0-9-_]{32,44})(\/|$)/;
const PAIR_REGEX = /\$([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/;
const URL_REGEX = /(https?:\/\/[^\s]+)/;
const CONTRACT_ADDRESS_REGEX =
  /^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})$/;
const CHAIN_EXPLORERS = {
  ethereum: "https://api.etherscan.io/api",
  bsc: "https://api.bscscan.com/api",
  polygon: "https://api.polygonscan.com/api",
  arbitrum: "https://api.arbiscan.io/api",
  optimism: "https://api.optimistic.etherscan.io/api",
  solana: "https://api.solscan.io/account",
};

// --- Type Definitions ---
interface CoinData {
  name: string;
  symbol: string;
  price: number;
  change24h: number | null;
  baseSymbol?: string;
  pairAddress?: string;
  contractAddress?: string;
  chain?: string;
  imageUrl?: string;
}

// Add new interface for analysis data
interface AnalysisData {
  price: string;
  entryStrategy: string;
  leverage: string;
  stopLoss: string;
  takeProfit: string;
  duration: string;
  riskLevel: string;
  summary: string;
  tradeType?: string;
}

// --- Prompts ---
const SAMARITAN_PROMPT = `You are Finvero, a specialized cryptocurrency investment advisor. Generate analysis in this exact JSON format:
{{
  "price": "$0.000025 (format: $X.XXXXX, include 24h change if available)",
  "entryStrategy": "Long/Short at $X.XXXXX (specific price/condition)",
  "leverage": "xX (number between 3-20)",
  "stopLoss": "$X.XXXXX ➘ (with arrow)",
  "takeProfit": "$X.XXXXX ➚ (with arrow)",
  "duration": "X-Xh (time in hours)",
  "riskLevel": "🔴 High/🟠 Medium/🟢 Low",
  "summary": "One paragraph summarizing key analysis points"
}}

Analysis Requirements:
1. Base recommendations on technical analysis and market sentiment
2. Include precise numerical values for all metrics
3. Risk assessment must match volatility and leverage
4. Summary should be concise (3-5 sentences) and actionable`;

// Add new SUMMARY_PROMPT
const SUMMARY_PROMPT = `Condense this trading analysis into a single paragraph (5-7 sentences) highlighting:
- Key price levels and targets
- Risk-reward ratio
- Market conditions
- Recommended strategy
- Timeframe

Write in clear, professional language without markdown.`;

// Extraction prompt for queries without links – looks for tokens with a '$'
const EXTRACT_PROMPT = `You are an assistant that extracts cryptocurrency symbols or names mentioned in a sentence.
If a word is prefixed with a '$' sign (e.g., $chillguy), extract it as a cryptocurrency name.
If multiple coins are mentioned, list them separated by commas.
If no cryptocurrency is mentioned, respond with "none".

Extract from the following input:
"{input}"`;

// This prompt is used when a link is provided. It extracts the coin name and current price from the text.
const LINK_EXTRACTION_PROMPT = `You are an assistant that extracts cryptocurrency information from a block of text.
Look for the cryptocurrency name and its current price.
If found, output in the format: "Coin: <coin_name>, Price: <current_price>".
If no cryptocurrency information is detected, output "none".

Text: "{input}"`;

// Update FORMATTING_PROMPT with static class names
const FORMATTING_PROMPT = `
<div class="flex items-center gap-4 mb-6">
  {{coinImage}}
  <h1 class="text-2xl font-bold tracking-wide {{fontClass}}">
    <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-300">{{coinName}}</span> 
    <span class="text-gray-200">Analysis</span>
  </h1>
</div>
<table class="w-full border-collapse bg-gradient-to-br from-blue-500/5 to-purple-500/10 backdrop-blur-sm rounded-lg overflow-hidden border border-blue-500/20">
  <thead class="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
    <tr>
      <th class="p-3 text-left text-blue-300 font-semibold">Metric</th>
      <th class="p-3 text-left text-blue-300 font-semibold">Value</th>
    </tr>
  </thead>
  <tbody>
    <!-- Price Section -->
    <tr class="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors">
      <td class="p-3 text-gray-200 font-medium">💰 Current Price</td>
      <td class="p-3 font-semibold">
        <span class="text-violet-300">{{basePrice}}</span>
        <span class="{{priceChangeColor}}">{{priceChange}}</span>
      </td>
    </tr>
    
    <!-- Trade Type -->
    <tr class="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors">
      <td class="p-3 text-gray-200 font-medium">🔀 Type of Trade</td>
      <td class="p-3 {{tradeColor}} font-semibold">{{tradeType}}</td>
    </tr>
    
    <!-- Spacer -->
    <tr><td colspan="2" class="h-4"></td></tr>
    
    <!-- Entry Levels -->
    <tr class="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors">
      <td class="p-3 text-gray-200 font-medium">📈 Entry</td>
      <td class="p-3 text-gray-300 font-semibold">{{entryText}} <span class="{{entryColor}}">{{entryPrice}}</span>{{entryReason}}</td>
    </tr>
    <tr class="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors">
      <td class="p-3 text-gray-200 font-medium">🎯 Take Profit</td>
      <td class="p-3 text-emerald-400 font-semibold">{{takeProfit}}</td>
    </tr>
    <tr class="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors">
      <td class="p-3 text-gray-200 font-medium">🛑 Stop Loss</td>
      <td class="p-3 text-rose-400 font-semibold">{{stopLoss}}</td>
    </tr>
    <tr class="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors">
      <td class="p-3 text-gray-200 font-medium">⚖️ Leverage</td>
      <td class="p-3 text-amber-400 font-semibold">{{leverage}}</td>
    </tr>
    
    <!-- Spacer -->
    <tr><td colspan="2" class="h-4"></td></tr>
    
    <!-- Risk Management -->
    <tr class="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors">
      <td class="p-3 text-gray-200 font-medium">⏳ Duration</td>
      <td class="p-3 text-violet-300 font-semibold">{{duration}}</td>
    </tr>
    <tr class="hover:bg-blue-500/5 transition-colors">
      <td class="p-3 text-gray-200 font-medium">🔒 Risk</td>
      <td class="p-3 {{riskColor}} font-semibold">{{riskLevel}}</td>
    </tr>
  </tbody>
</table>`;

// --- Helper Functions ---
async function fetchSearchResults(query: string) {
  axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  const url = GOOGLE_SEARCH_URL;

  const params = {
    q: query,
    key: apiKey,
    cx: cx,
  };

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    throw new Error("Failed to fetch search results");
  }
}

// Optimize axios with better retry strategy
const axiosInstance = axios.create();
axiosRetry(axiosInstance, {
  retries: 2, // Reduced from 3
  retryDelay: (retryCount) => retryCount * 1000, // Linear backoff instead of exponential
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNABORTED"
    );
  },
  timeout: 5000, // 5 second timeout
});

async function fetchCoinGeckoPrice(coinId: string): Promise<CoinData | null> {
  try {
    console.log("[COINGECKO_PRICE] Starting price fetch for:", coinId);
    axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

    console.log("[COINGECKO_SEARCH] Searching for coin:", coinId);
    const searchResponse = await axios.get(
      `${COINGECKO_API_BASE}/search?query=${coinId}`
    );

    const coinMatch = searchResponse.data.coins.find(
      (coin: any) =>
        coin.symbol.toLowerCase() === coinId.toLowerCase() ||
        coin.id.toLowerCase() === coinId.toLowerCase()
    );

    if (!coinMatch) {
      console.log("[COINGECKO_SEARCH] No coin match found");
      return null;
    }

    console.log("[COINGECKO_PRICE] Fetching price for coin ID:", coinMatch.id);
    const priceResponse = await axios.get(
      `${COINGECKO_API_BASE}/simple/price?ids=${coinMatch.id}&vs_currencies=usd&include_24hr_change=true`
    );

    if (priceResponse.data[coinMatch.id]) {
      const data = priceResponse.data[coinMatch.id];

      const imageUrl =
        coinMatch.large ||
        coinMatch.thumb ||
        coinMatch.small ||
        `https://assets.coingecko.com/coins/images/${coinMatch.id}/large/${coinMatch.id}.png`;

      try {
        await trackCoinSearch({
          name: coinMatch.name,
          symbol: coinMatch.symbol,
          logo: imageUrl,
          geckoId: coinMatch.id,
        });
      } catch (error) {
        console.error("[SEARCH_TRACKING_ERROR]:", error);
      }

      return {
        name: coinMatch.name,
        symbol: coinMatch.symbol.toUpperCase(),
        price: data.usd,
        change24h: data.usd_24h_change ?? null,
        imageUrl: imageUrl,
      };
    }
    return null;
  } catch (error) {
    console.error("[COINGECKO_ERROR]", error);
    return null;
  }
}

async function fetchDexscreenerPrice(
  tokenSymbol: string,
  baseSymbol: string
): Promise<CoinData | null> {
  try {
    axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
    const pairResponse = await axios.get(
      `${DEXSCREENER_API_BASE}/search?q=${tokenSymbol}/${baseSymbol}`
    );
    const pairs = pairResponse.data.pairs;

    if (!pairs || pairs.length === 0) {
      return null;
    }

    let bestPair = null;
    for (const pair of pairs) {
      if (
        pair.baseToken.symbol.toUpperCase() === tokenSymbol.toUpperCase() &&
        pair.quoteToken.symbol.toUpperCase() === baseSymbol.toUpperCase()
      ) {
        if (!bestPair || pair.liquidity.usd > bestPair.liquidity.usd) {
          bestPair = pair;
        }
      }
    }
    if (!bestPair) {
      return null;
    }

    let priceUsd = parseFloat(bestPair.priceNative);
    if (bestPair.quoteToken.symbol.toUpperCase() !== "USDC") {
      const quoteTokenPriceResponse = await axios.get(
        `${DEXSCREENER_API_BASE}/tokens/${bestPair.quoteToken.address}`
      );

      const quoteTokenPairs = quoteTokenPriceResponse.data.pairs;

      if (!quoteTokenPairs || quoteTokenPairs.length === 0) {
        return null;
      }

      let usdQuotePair = null;
      for (const pair of quoteTokenPairs) {
        if (pair.quoteToken.symbol.toUpperCase() === "USDC") {
          if (
            !usdQuotePair ||
            (pair.liquidity?.usd ?? 0) > (usdQuotePair.liquidity?.usd ?? 0)
          ) {
            usdQuotePair = pair;
          }
        }
      }

      if (!usdQuotePair) {
        return null;
      }

      const quoteTokenPriceUsd = parseFloat(usdQuotePair.priceNative);
      priceUsd *= quoteTokenPriceUsd;
    }

    return {
      name: bestPair.baseToken.name,
      symbol: bestPair.baseToken.symbol.toUpperCase(),
      price: priceUsd,
      change24h: bestPair.priceChange.h24,
      baseSymbol: bestPair.quoteToken.symbol.toUpperCase(),
      pairAddress: bestPair.pairAddress,
      imageUrl:
        bestPair.baseToken.logoURI ||
        `https://cdn.dexscreener.com/blockchain/${bestPair.chainId}/logo.png`,
    };
  } catch (error) {
    console.error("[DEXSCREENER_ERROR]", error);
    return null;
  }
}

function extractURL(text: string): string | null {
  const match = text.match(URL_REGEX);
  return match ? match[0] : null;
}

function extractCoinGeckoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const match = parsedUrl.pathname.match(/\/en\/coins\/([a-zA-Z0-9-]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch (error) {
    return null;
  }
}

function extractDexscreenerPair(
  text: string
): { token: string; base: string } | null {
  const urlMatch = text.match(DEXSCREENER_URL_REGEX);

  if (urlMatch) {
    return { token: urlMatch[1], base: "DIRECT" };
  }

  const match = text.match(PAIR_REGEX);
  if (match) {
    return { token: match[1], base: match[2] };
  }
  return null;
}

async function fetchTokenFromContract(
  address: string
): Promise<CoinData | null> {
  try {
    console.log("[CONTRACT] Attempting DexScreener token lookup");
    const dexResponse = await axios.get(
      `${DEXSCREENER_API_BASE}/tokens/${address}`
    );
    console.log("[CONTRACT] DexScreener response:", dexResponse.data);

    if (dexResponse.data.pairs && dexResponse.data.pairs.length > 0) {
      const bestPair = dexResponse.data.pairs.reduce(
        (prev: any, current: any) => {
          return (prev.liquidity?.usd || 0) > (current.liquidity?.usd || 0)
            ? prev
            : current;
        }
      );

      return {
        name: bestPair.baseToken.name || "Unknown Token",
        symbol: bestPair.baseToken.symbol.toUpperCase(),
        price: parseFloat(bestPair.priceUsd || "0"),
        change24h: parseFloat(bestPair.priceChange?.h24 || "0"),
        contractAddress: address,
        chain: bestPair.chainId,
        baseSymbol: bestPair.quoteToken.symbol,
        pairAddress: bestPair.pairAddress,
        imageUrl:
          bestPair.info?.imageUrl ||
          bestPair.baseToken.logoURI ||
          `https://cdn.dexscreener.com/blockchain/${bestPair.chainId}/logo.png`,
      };
    }

    if (address.length >= 32 && address.length <= 44) {
      console.log(
        "[CONTRACT] Detected Solana-length address, skipping chain explorers"
      );
      return null;
    }

    console.log("[CONTRACT] Attempting chain explorer lookups");
    for (const [chain, apiUrl] of Object.entries(CHAIN_EXPLORERS)) {
      if (!process.env[`${chain.toUpperCase()}_SCAN_API_KEY`]) {
        console.log(`[CONTRACT] Skipping ${chain} - no API key configured`);
        continue;
      }

      try {
        const response = await axios.get(apiUrl, {
          params: {
            module: "token",
            action: "tokeninfo",
            contractaddress: address,
            apikey: process.env[`${chain.toUpperCase()}_SCAN_API_KEY`],
          },
        });

        if (response.data.status === "1" && response.data.result) {
          const tokenInfo = response.data.result[0];
          console.log(`[CONTRACT] Found token on ${chain}:`, tokenInfo);

          const coinGeckoData = await fetchCoinGeckoPrice(tokenInfo.symbol);

          return {
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            price: coinGeckoData?.price || 0,
            change24h: coinGeckoData?.change24h || null,
            contractAddress: address,
            chain: chain,
            imageUrl: coinGeckoData?.imageUrl,
          };
        }
      } catch (error) {
        console.log(`[CONTRACT] Error checking ${chain}:`, error.message);
      }
    }

    return null;
  } catch (error) {
    console.error("[CONTRACT_FETCH_ERROR]", error);
    return null;
  }
}

async function fetchDexscreenerPairInfo(
  chain: string,
  pairAddress: string
): Promise<CoinData | null> {
  try {
    console.log(
      "[DEXSCREENER_PAIR_INFO] Starting fetch for chain:",
      chain,
      "address:",
      pairAddress
    );
    axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });


    const pairsUrl = `${DEXSCREENER_API_BASE}/pairs/${chain}/${pairAddress}`;
    console.log("[DEXSCREENER_PAIR_INFO] Trying pairs URL:", pairsUrl);

    const pairResponse = await axios.get(pairsUrl);
    console.log(
      "[DEXSCREENER_PAIR_INFO] Pairs API response:",
      pairResponse.data
    );

    if (pairResponse.data.pair) {
      const pair = pairResponse.data.pair;
      return {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol.toUpperCase(),
        price: parseFloat(pair.priceUsd || pair.priceNative),
        change24h: pair.priceChange?.h24 || null,
        baseSymbol: pair.quoteToken.symbol.toUpperCase(),
        pairAddress: pair.pairAddress,
        contractAddress: pair.baseToken.address,
        chain: pair.chainId,
        imageUrl:
          pair.info?.imageUrl ||
          pair.baseToken.logoURI ||
          `https://cdn.dexscreener.com/blockchain/${pair.chainId}/logo.png`,
      };
    }


    if (chain.toLowerCase() === "solana") {
      const tokensUrl = `${DEXSCREENER_API_BASE}/tokens/${pairAddress}`;
      console.log("[DEXSCREENER_PAIR_INFO] Trying tokens URL:", tokensUrl);

      const tokenResponse = await axios.get(tokensUrl);
      console.log(
        "[DEXSCREENER_PAIR_INFO] Tokens API response:",
        tokenResponse.data
      );

      if (tokenResponse.data.pairs && tokenResponse.data.pairs.length > 0) {
        const bestPair = tokenResponse.data.pairs.reduce(
          (prev: any, current: any) =>
            (prev.liquidity?.usd || 0) > (current.liquidity?.usd || 0)
              ? prev
              : current
        );

        return {
          name: bestPair.baseToken.name,
          symbol: bestPair.baseToken.symbol.toUpperCase(),
          price: parseFloat(bestPair.priceUsd || bestPair.priceNative),
          change24h: bestPair.priceChange?.h24 || null,
          baseSymbol: bestPair.quoteToken.symbol.toUpperCase(),
          pairAddress: bestPair.pairAddress,
          contractAddress: bestPair.baseToken.address,
          chain: bestPair.chainId,
          imageUrl:
            bestPair.info?.imageUrl ||
            bestPair.baseToken.logoURI ||
            `https://cdn.dexscreener.com/blockchain/${bestPair.chainId}/logo.png`,
        };
      }
    }

    console.log("[DEXSCREENER_PAIR_INFO] No valid pair or token data found");
    return null;
  } catch (error) {
    console.error("[DEXSCREENER_ERROR]", error);
    return null;
  }
}


async function getCoinData(userInput: string): Promise<CoinData | null> {
  console.log("[GET_COIN_DATA] Starting with input:", userInput);


  const [link, isContract] = await Promise.all([
    Promise.resolve(extractURL(userInput)),
    Promise.resolve(CONTRACT_ADDRESS_REGEX.test(userInput.trim())),
  ]);

  if (link) {
    const coinGeckoId = extractCoinGeckoId(link);
    if (coinGeckoId) {
      const coinData = await fetchCoinGeckoPrice(coinGeckoId);
      if (coinData) return coinData;
    }

    const dexscreenerMatch = userInput.match(DEXSCREENER_URL_REGEX);
    if (dexscreenerMatch) {
      const [_, chain, pairAddress] = dexscreenerMatch;
      if (!pairAddress) return null;
      return await fetchDexscreenerPairInfo(chain, pairAddress);
    }
  }

  if (isContract) {
    const caData = await fetchTokenFromContract(userInput.trim());
    if (caData) return caData;
  }


  if (userInput.startsWith("$")) {
    const symbol = userInput.substring(1).split(/[\s,/]/)[0];
    const [coinGeckoData, dexScreenerData] = await Promise.all([
      fetchCoinGeckoPrice(symbol),
      fetchDexscreenerPrice(symbol, "USDC"),
    ]);

    return coinGeckoData || dexScreenerData || null;
  }


  const extractChain = ChatPromptTemplate.fromMessages([
    ["system", EXTRACT_PROMPT],
    ["human", "{input}"],
  ]).pipe(
    new ChatGoogleGenerativeAI({
      modelName: "gemini-2.0-flash-exp",
      maxRetries: 2,
      temperature: 0.8,
      apiKey: process.env.GOOGLE_API_KEY,
    })
  );

  const extractionResponse = await extractChain.invoke({
    input: userInput,
  });

  const cryptoSymbols = extractionResponse.content.trim();
  if (cryptoSymbols.toLowerCase() === "none" || cryptoSymbols === "") {
    return null;
  }

  const symbol = cryptoSymbols.split(/[\s,]+/)[0].replace("$", "");
  const [coinGeckoData, dexScreenerData] = await Promise.all([
    fetchCoinGeckoPrice(symbol),
    fetchDexscreenerPrice(symbol, "USDC"),
  ]);

  return coinGeckoData || dexScreenerData || null;
}

async function formatTradingRecommendation(
  analysisData: AnalysisData,
  model: ChatGoogleGenerativeAI,
  coinData: CoinData
): Promise<string> {
  const { urbanist } = await import("@/app/fonts");

  const coinImageHtml = coinData.imageUrl
    ? `<img src="${coinData.imageUrl}" alt="${coinData.symbol}" class="w-12 h-12 rounded-full ring-2 ring-blue-500/20" />`
    : `<div class="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-lg font-semibold text-blue-400 ring-2 ring-blue-500/20">${coinData.symbol}</div>`;

  const tableHTML = FORMATTING_PROMPT.replace(
    "{{fontClass}}",
    urbanist.className
  )
    .replace("{{coinImage}}", coinImageHtml)
    .replace("{{coinName}}", coinData.name)
    .replace("{{basePrice}}", analysisData.price)
    .replace(
      "{{priceChange}}",
      analysisData.price.includes("(")
        ? ""
        : ` (${analysisData.price.split(" ")[1]})`
    )
    .replace(
      "{{priceChangeColor}}",
      analysisData.priceChangeColor || "text-gray-400"
    )
    .replace("{{tradeType}}", analysisData.tradeType || "Long")
    .replace(
      "{{tradeColor}}",
      analysisData.tradeType === "Short" ? "text-rose-400" : "text-emerald-400"
    )
    .replace(
      "{{entryText}}",
      analysisData.entryStrategy.split(" at ")[0] + " at "
    )
    .replace("{{entryPrice}}", analysisData.entryStrategy.split(" at ")[1])
    .replace(
      "{{entryColor}}",
      analysisData.tradeType === "Short" ? "text-rose-400" : "text-emerald-400"
    )
    .replace("{{entryReason}}", "")
    .replace("{{stopLoss}}", analysisData.stopLoss)
    .replace("{{takeProfit}}", analysisData.takeProfit)
    .replace("{{leverage}}", analysisData.leverage)
    .replace("{{duration}}", analysisData.duration)
    .replace("{{riskLevel}}", analysisData.riskLevel)
    .replace(
      "{{riskColor}}",
      analysisData.riskLevel.includes("🟢")
        ? "text-green-400"
        : analysisData.riskLevel.includes("🟠")
          ? "text-yellow-400"
          : "text-red-400"
    );


  const summaryPrompt = ChatPromptTemplate.fromMessages([
    ["system", SUMMARY_PROMPT],
    ["human", "{input}"],
  ]);

  const summaryChain = summaryPrompt.pipe(model);
  const summaryResponse = await summaryChain.invoke({
    input: analysisData.summary,
  });

  return `${tableHTML}\n\n<div class="mt-6 p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/10 rounded-lg backdrop-blur-sm border border-blue-500/20">\n  <h3 class="text-lg font-semibold text-blue-300 mb-2 flex items-center gap-2"><span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-300">Summary</span></h3>\n  <p class="text-gray-300 leading-relaxed">${summaryResponse.content}</p>\n</div>`;
}


async function generateTradingRecommendation(
  coinData: CoinData,
  chatHistory: { role: string; content: string }[],
  model: ChatGoogleGenerativeAI,
  lastMessage: string
): Promise<AnalysisData> {
  const marketData = `Current market data for ${coinData.name} (${coinData.symbol
    }${coinData.baseSymbol ? "/" + coinData.baseSymbol : ""}):
- Price: $${coinData.price.toFixed(8)}${coinData.change24h
      ? ` (${coinData.change24h > 0 ? "+" : ""}${coinData.change24h.toFixed(
        2
      )}%)`
      : ""
    }`;

  const analysisChain = ChatPromptTemplate.fromMessages([
    ["system", SAMARITAN_PROMPT],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]).pipe(model);

  try {
    const response = await analysisChain.invoke({
      chat_history: chatHistory,
      input: `${lastMessage}\n\n${marketData}`,
    });

    const parsed = JSON.parse(
      response.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );


    const entryPriceMatch = parsed.entryStrategy?.match(/\$([\d.]+)/);
    const entryPrice = entryPriceMatch
      ? parseFloat(entryPriceMatch[1])
      : coinData.price;


    const takeProfitPriceMatch = parsed.takeProfit?.match(/\$([\d.]+)/);
    const takeProfitPrice = takeProfitPriceMatch
      ? parseFloat(takeProfitPriceMatch[1])
      : null;
    const profitMultiplier =
      takeProfitPrice && entryPrice
        ? ` (${(takeProfitPrice / entryPrice).toFixed(1)}x)`
        : "";

    const variables = {
      price: parsed.price || `$${coinData.price.toFixed(8)}`,
      entryStrategy:
        parsed.entryStrategy || `Long at $${coinData.price.toFixed(8)}`,
      leverage: parsed.leverage || "x3",
      stopLoss: parsed.stopLoss || `$${(coinData.price * 0.97).toFixed(8)} ➘`,
      takeProfit: parsed.stopLoss
        ? `${parsed.takeProfit}`
        : `$${(coinData.price * 1.05).toFixed(8)} ➚ (1.05x)`,
      duration: parsed.duration || "4-6h",
      riskLevel: parsed.riskLevel || "🟠 Medium",
      summary:
        parsed.summary ||
        `Analysis for ${coinData.symbol} at $${coinData.price.toFixed(8)}${coinData.change24h
          ? ` (${coinData.change24h > 0 ? "+" : ""
          }${coinData.change24h.toFixed(2)}%)`
          : ""
        }`,
      tradeType: parsed.entryStrategy?.toLowerCase().includes("short")
        ? "Short"
        : "Long",
      priceChange: coinData.change24h
        ? `${coinData.change24h > 0 ? "+" : ""}${coinData.change24h.toFixed(
          2
        )}%`
        : "",
      priceChangeColor: coinData.change24h
        ? coinData.change24h > 0
          ? "text-green-400"
          : "text-red-400"
        : "text-gray-400",
      riskColor: parsed.riskLevel.includes("🟢")
        ? "text-green-400"
        : parsed.riskLevel.includes("🟠")
          ? "text-yellow-400"
          : "text-red-400",
    };

    return variables;
  } catch (error) {
    console.error("Analysis generation error:", error);
    return generateFallbackAnalysis(coinData);
  }
}

const requestSchema = z.object({
  messages: z.array(z.array(z.string())),
});

export async function POST(req: Request) {
  try {
    console.log("[POST] Starting request processing");
    const validatedReq = requestSchema.safeParse(await req.json());
    if (!validatedReq.success) {
      console.log("[POST] Invalid request format:", validatedReq.error);
      return NextResponse.json(
        { error: "Invalid input format." },
        { status: 400 }
      );
    }

    console.log("[POST] Request validated successfully");
    const { messages } = validatedReq.data;

    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-2.0-flash-exp",
      maxRetries: 1,
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY,
      maxOutputTokens: 500,
    });


    const chatHistory = messages.slice(0, -1).map((msg) => ({
      role: msg[0] === "user" ? "human" : "assistant",
      content: msg[1],
    }));


    const lastMessage = messages[messages.length - 1][1];


    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(SAMARITAN_PROMPT),
      new MessagesPlaceholder("chat_history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const chain = chatPrompt.pipe(model);

    const coinData = await getCoinData(lastMessage);

    if (!coinData) {
      return NextResponse.json({
        content:
          "I couldn't detect a valid cryptocurrency. Please provide a valid CoinGecko or DexScreener link, a contract address (CA), or use the '$' prefix (e.g., '$BTC').",
      });
    }

    const analysisData = await generateTradingRecommendation(
      coinData,
      chatHistory,
      model,
      lastMessage
    );

    const formattedRecommendation = await formatTradingRecommendation(
      analysisData,
      model,
      coinData
    );

    return NextResponse.json({
      content: formattedRecommendation,
      rawContent: JSON.stringify(analysisData),
      coinData: coinData
        ? {
          name: coinData.name,
          symbol: coinData.symbol,
        }
        : null,
    });
  } catch (error) {
    console.error("[CHAT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
