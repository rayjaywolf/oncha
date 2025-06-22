import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate, // We need this back
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import axios from "axios";
import axiosRetry from "axios-retry";
import { z } from "zod";

// --- Constants ---
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const DEXSCREENER_API_BASE = "https://api.dexscreener.com/latest/dex";
const URL_REGEX = /(https?:\/\/[^\s]+)/;
const CONTRACT_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const DEXSCREENER_URL_REGEX = /dexscreener\.com\/([^\/]+)\/([a-zA-Z0-9]{40,})/;

// --- Type Definitions ---
interface CoinData {
  name: string;
  symbol: string;
  price: number;
  change24h: number | null;
  imageUrl?: string;
  baseSymbol?: string;
}

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
  priceChangeColor?: string;
}

// --- System Prompt ---
const FINVERO_SYSTEM_PROMPT = `You are Finvero, a specialized cryptocurrency investment advisor. Your analysis is sharp, concise, and actionable. You will receive market data and a user query. Your goal is to generate a trading plan in a precise JSON format.

**JSON Output Format:**
You MUST respond with ONLY a JSON object in the following structure:
{{
  "price": "$0.000025 (24h change: +X.XX%)",
  "entryStrategy": "Long at $X.XXXXX",
  "leverage": "x10",
  "stopLoss": "$X.XXXXX ➘",
  "takeProfit": "$X.XXXXX ➚",
  "duration": "X-Xh",
  "riskLevel": "🔴 High",
  "summary": "A one-paragraph summary of the trading plan, key levels, and market sentiment."
}}

**Analysis Guidelines:**
1.  **Data-Driven:** Base your recommendations on the provided market data (price, 24h change).
2.  **Clarity:** Use clear, direct language. The entry strategy must be either "Long" or "Short".
3.  **Risk Management:**
    * Leverage must be between x3 and x20. Higher volatility coins should have lower leverage.
    * The risk level (🟢 Low, 🟠 Medium, 🔴 High) must directly correspond to the coin's volatility (indicated by 24h change) and the chosen leverage.
    * Stop-loss and take-profit levels must be realistic.
4.  **Conciseness:** The summary should be a single, impactful paragraph (3-5 sentences).`;


// --- Helper Functions ---
const axiosInstance = axios.create({ timeout: 10000 });
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 429
    );
  },
});

async function fetchCoinGeckoPrice(coinId: string): Promise<CoinData | null> {
  try {
    const searchUrl = `${COINGECKO_API_BASE}/search?query=${coinId}`;
    const searchResponse = await axiosInstance.get(searchUrl);
    const coin = searchResponse.data.coins[0];
    if (!coin) return null;
    const priceUrl = `${COINGECKO_API_BASE}/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true`;
    const priceResponse = await axiosInstance.get(priceUrl);
    const data = priceResponse.data[coin.id];
    if (!data) return null;
    return { name: coin.name, symbol: coin.symbol.toUpperCase(), price: data.usd, change24h: data.usd_24h_change, imageUrl: coin.large };
  } catch (error) {
    console.error("[COINGECKO_ERROR]", error);
    return null;
  }
}

async function fetchDexScreenerDataByPair(chain: string, pairAddress: string): Promise<CoinData | null> {
    try {
        const url = `${DEXSCREENER_API_BASE}/pairs/${chain}/${pairAddress}`;
        const response = await axiosInstance.get(url);
        const pair = response.data.pair;
        if (!pair) return null;
        return { name: pair.baseToken.name, symbol: pair.baseToken.symbol.toUpperCase(), price: parseFloat(pair.priceUsd), change24h: pair.priceChange.h24, imageUrl: pair.info?.imageUrl, baseSymbol: pair.quoteToken.symbol };
    } catch (error) {
        console.error("[DEXSCREENER_PAIR_ERROR]", error);
        return null;
    }
}

async function fetchDexScreenerDataByContract(address: string): Promise<CoinData | null> {
    try {
        const url = `${DEXSCREENER_API_BASE}/search?q=${address}`;
        const response = await axiosInstance.get(url);
        const bestPair = response.data.pairs?.sort((a:any, b:any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
        if (!bestPair) return null;
        return { name: bestPair.baseToken.name, symbol: bestPair.baseToken.symbol.toUpperCase(), price: parseFloat(bestPair.priceUsd), change24h: bestPair.priceChange.h24, imageUrl: bestPair.info?.imageUrl, baseSymbol: bestPair.quoteToken.symbol };
    } catch (error) {
        console.error("[DEXSCREENER_CONTRACT_ERROR]", error);
        return null;
    }
}

async function getCoinData(userInput: string): Promise<CoinData | null> {
  const trimmedInput = userInput.trim();
  const urlMatch = trimmedInput.match(URL_REGEX);
  if (urlMatch) {
    const url = urlMatch[0];
    const coingeckoMatch = url.match(/coingecko\.com\/en\/coins\/([a-zA-Z0-9-]+)/);
    if (coingeckoMatch) return fetchCoinGeckoPrice(coingeckoMatch[1]);
    const dexscreenerMatch = url.match(DEXSCREENER_URL_REGEX);
    if (dexscreenerMatch) return fetchDexScreenerDataByPair(dexscreenerMatch[1], dexscreenerMatch[2]);
  }
  if (CONTRACT_ADDRESS_REGEX.test(trimmedInput)) return fetchDexScreenerDataByContract(trimmedInput);
  const symbolMatch = trimmedInput.match(/^\$?([a-zA-Z0-9]+)/);
  if (symbolMatch) {
    const symbol = symbolMatch[1];
    const coingeckoData = await fetchCoinGeckoPrice(symbol);
    if (coingeckoData) return coingeckoData;
    const dexscreenerData = await fetchDexScreenerDataByContract(symbol);
    return dexscreenerData;
  }
  return null;
}

function formatAnalysisToHtml(analysis: AnalysisData, coin: CoinData): string {
    const tradeColor = analysis.tradeType?.toLowerCase() === 'short' ? 'text-rose-400' : 'text-emerald-400';
    const riskColor = analysis.riskLevel?.includes("Low") ? "text-green-400" : analysis.riskLevel?.includes("Medium") ? "text-amber-400" : "text-red-400";
    const priceChange = coin.change24h ?? 0;
    const priceChangeColor = priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400';
    const priceChangeString = `(${(priceChange >= 0 ? '+' : '') + priceChange.toFixed(2)}%)`;
    const coinImageHtml = coin.imageUrl ? `<img src="${coin.imageUrl}" alt="${coin.symbol}" class="w-12 h-12 rounded-full ring-2 ring-blue-500/20" />` : `<div class="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-lg font-semibold text-blue-400 ring-2 ring-blue-500/20">${coin.symbol}</div>`;
    return `<div class="flex items-center gap-4 mb-6">${coinImageHtml}<h1 class="text-2xl font-bold tracking-wide"><span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-300">${coin.name}</span> <span class="text-gray-200">Analysis</span></h1></div><table class="w-full border-collapse bg-gradient-to-br from-blue-500/5 to-purple-500/10 backdrop-blur-sm rounded-lg overflow-hidden border border-blue-500/20"><tbody><tr class="border-b border-blue-500/10"><td class="p-3 text-gray-200 font-medium">💰 Current Price</td><td class="p-3 font-semibold text-violet-300">${analysis.price.split(' ')[0]} <span class="${priceChangeColor}">${priceChangeString}</span></td></tr><tr class="border-b border-blue-500/10"><td class="p-3 text-gray-200 font-medium">🔀 Trade Type</td><td class="p-3 ${tradeColor} font-semibold">${analysis.tradeType}</td></tr><tr class="border-b border-blue-500/10"><td class="p-3 text-gray-200 font-medium">📈 Entry</td><td class="p-3 ${tradeColor} font-semibold">${analysis.entryStrategy}</td></tr><tr class="border-b border-blue-500/10"><td class="p-3 text-gray-200 font-medium">🎯 Take Profit</td><td class="p-3 text-emerald-400 font-semibold">${analysis.takeProfit}</td></tr><tr class="border-b border-blue-500/10"><td class="p-3 text-gray-200 font-medium">🛑 Stop Loss</td><td class="p-3 text-rose-400 font-semibold">${analysis.stopLoss}</td></tr><tr class="border-b border-blue-500/10"><td class="p-3 text-gray-200 font-medium">⚖️ Leverage</td><td class="p-3 text-amber-400 font-semibold">${analysis.leverage}</td></tr><tr class="border-b border-blue-500/10"><td class="p-3 text-gray-200 font-medium">⏳ Duration</td><td class="p-3 text-violet-300 font-semibold">${analysis.duration}</td></tr><tr><td class="p-3 text-gray-200 font-medium">🔒 Risk</td><td class="p-3 ${riskColor} font-semibold">${analysis.riskLevel}</td></tr></tbody></table><div class="mt-6 p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/10 rounded-lg backdrop-blur-sm border border-blue-500/20"><h3 class="text-lg font-semibold text-blue-300 mb-2">Summary</h3><p class="text-gray-300 leading-relaxed">${analysis.summary}</p></div>`;
}

// --- Main Handler ---
const requestSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedReq = requestSchema.safeParse(body);
    if (!validatedReq.success) return NextResponse.json({ error: "Invalid input format." }, { status: 400 });
    const { messages } = validatedReq.data;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') return NextResponse.json({ error: "No user message found." }, { status: 400 });
    const coinData = await getCoinData(lastMessage.content);
    if (!coinData) return NextResponse.json({ content: "I couldn't identify a valid cryptocurrency. Please provide a CoinGecko/DexScreener link, a contract address, or a symbol like '$BTC'." });

    // ================= FIX #1: UPDATE THE MODEL NAME =================
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash", // Using the latest stable flash model
      temperature: 0.6,
      apiKey: process.env.GOOGLE_API_KEY,
    });
    
    const chatHistory = messages.slice(0, -1).map(msg => {
        if (msg.role === 'user') return new HumanMessage(msg.content);
        return new AIMessage("I have provided an analysis.");
    });

    // ================= FIX #2: CORRECT THE PROMPT TEMPLATE =================
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(FINVERO_SYSTEM_PROMPT),
      new MessagesPlaceholder("chat_history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"), // This MUST be a HumanMessage
    ]);

    const chain = prompt.pipe(model);
    
    const marketData = `Current data for ${coinData.name} (${coinData.symbol}): Price is $${coinData.price.toFixed(6)}, 24h change is ${coinData.change24h?.toFixed(2) ?? 'N/A'}%.`;
    const input = `${lastMessage.content}\n\n${marketData}`;

    const response = await chain.invoke({
      chat_history: chatHistory,
      input: input,
    });

    const rawContent = response.content.toString().replace(/```json/g, "").replace(/```/g, "").trim();
    const analysisData = JSON.parse(rawContent) as AnalysisData;
    analysisData.tradeType = analysisData.entryStrategy?.toLowerCase().includes("short") ? "Short" : "Long";
    const formattedHtml = formatAnalysisToHtml(analysisData, coinData);
    return NextResponse.json({ content: formattedHtml });

  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: "An error occurred during analysis.", details: errorMessage }, { status: 500 });
  }
}