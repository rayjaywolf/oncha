import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import axios from "axios";
import axiosRetry from "axios-retry";
import { z } from "zod";
import { TavilySearch } from "@langchain/tavily";

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

interface FinancialAnalysisData {
  coinName: string;
  coinSymbol: string;
  price: string;
  entryStrategy: string;
  leverage: string;
  stopLoss: string;
  takeProfit: string;
  duration: string;
  riskLevel: string;
  technicalSummary: string;
  fundamentalSummary: string;
  tradeType?: string;
}


// --- System Prompt (Upgraded to correctly parse trading pairs) ---
const FINVERO_SYSTEM_PROMPT = `You are Finvero, a world-class hybrid cryptocurrency analyst, blending technical chart analysis with fundamental, news-based insights. Your analysis is not just a plan; it's a complete, educational breakdown that makes the user smarter. You are sharp, insightful, and "informative as fuck".

You will be given a combination of inputs:
1.  **Primary Input:** EITHER a trading chart image OR text-based market data (price, 24h change).
2.  **Secondary Input (if available):** A collection of recent news summaries about the asset and/or the broader crypto market.

**Your Core Directives:**
1.  **Synthesize, Don't Just List:** Do not just repeat the news. You MUST connect the dots. Explain how the news (fundamental analysis) might be influencing the patterns you see in the chart (technical analysis).
2.  **Handle Absence of Specific News:** The 'Fundamental Data' section will explicitly state if no specific news was found for the asset. If this is the case, you MUST first acknowledge this clearly (e.g., "There is no significant, asset-specific news driving the price today."). Then, you MUST pivot to analyzing the provided 'General Market News' and explain how broader market trends (like Bitcoin's movement, regulatory news for the whole sector, or overall market sentiment) are likely influencing this specific asset.
3.  **Be an Educator:** Explain the 'why' behind everything. If you see a 'death cross' on the chart, explain what it is and why it matters, especially in the context of any negative market-wide news provided.

**JSON Output Format:**
You MUST respond with ONLY a JSON object in the following structure.

{{
  "coinName": "The full name of the primary coin being traded. When analyzing a chart image, find the trading pair (e.g., 'XTRADE/SOL', 'ETH/USD'). The primary coin is always the FIRST one in the pair. For 'XTRADE/SOL', the coin name is 'XTRADE', not 'SOL'.",
  "coinSymbol": "The ticker symbol for the primary coin. For a trading pair like 'XTRADE/SOL', the symbol is 'XTRADE'. For 'ETH/USD', the symbol is 'ETH'. Always take the token on the LEFT of the slash.",
  "price": "The current price visible in the chart or data (e.g., '$1.73M (+0.14%)'). Extract this directly from the chart.",
  "entryStrategy": "A specific trading action with a price point (e.g., 'Look for a Long entry on a retest of the $1.70M support level').",
  "leverage": "Appropriate leverage for the trade (e.g., 'x5', 'x10').",
  "stopLoss": "A specific price for the stop-loss order (e.g., '$1.65M ➘').",
  "takeProfit": "A specific price for the take-profit order (e.g., '$1.85M ➚').",
  "duration": "Estimated trade duration (e.g., '1-4h', '1-3d').",
  "riskLevel": "Risk assessment (🟢 Low, 🟠 Medium, 🔴 High) based on both technical volatility and fundamental news risks.",
  "technicalSummary": "A detailed, multi-paragraph technical summary. Explain the identified patterns (e.g., 'head and shoulders', 'bull flag'), indicator signals (RSI, MACD, MAs if visible), and volume analysis.",
  "fundamentalSummary": "A concise summary of the key takeaways from the provided news. If only general market news was provided, explain its relevance to this specific asset. If no news was found at all, state that price action is purely technical and sentiment-driven."
}}`;


// --- Tavily Web Search Function ---
async function performWebSearchWithTavily(query: string): Promise<string | null> {
    try {
        // Check if API key exists
        if (!process.env.TAVILY_API_KEY) {
            console.error("[TAVILY_ERROR] TAVILY_API_KEY is not configured");
            return "Could not fetch news: TAVILY_API_KEY is not configured in the environment.";
        }

        const tavilySearch = new TavilySearch({
            apiKey: process.env.TAVILY_API_KEY,
            maxResults: 5,
        });

        console.log("[TAVILY_SEARCH] Searching for:", query);
        const searchResults = await tavilySearch.invoke({ query: query });
        console.log("[TAVILY_SEARCH] Raw results:", typeof searchResults, searchResults);

        let formattedResults: string;

        // Handle different response formats
        if (Array.isArray(searchResults)) {
            if (searchResults.length === 0) {
                console.log("[TAVILY_SEARCH] No results found");
                return null;
            }
            
            formattedResults = searchResults.map((result: any) => {
                const title = result.title || result.name || "No title";
                const url = result.url || result.link || "No URL";
                const content = result.content || result.snippet || result.description || "No content";
                return `- Title: ${title}\n  URL: ${url}\n  Snippet: ${content}`;
            }).join('\n\n');
        } else if (typeof searchResults === 'string') {
            if (searchResults.trim().length === 0) {
                console.log("[TAVILY_SEARCH] Empty string result");
                return null;
            }
            formattedResults = searchResults;
        } else if (searchResults && typeof searchResults === 'object') {
            // Handle object response format
            if (searchResults.results && Array.isArray(searchResults.results)) {
                formattedResults = searchResults.results.map((result: any) => {
                    const title = result.title || result.name || "No title";
                    const url = result.url || result.link || "No URL";
                    const content = result.content || result.snippet || result.description || "No content";
                    return `- Title: ${title}\n  URL: ${url}\n  Snippet: ${content}`;
                }).join('\n\n');
            } else {
                console.log("[TAVILY_SEARCH] Unexpected object format:", searchResults);
                return null;
            }
        } else {
            console.log("[TAVILY_SEARCH] No valid results found");
            return null;
        }

        console.log("[TAVILY_SEARCH] Formatted results length:", formattedResults.length);
        return formattedResults;

    } catch (error) {
        console.error("[TAVILY_SEARCH_ERROR]", error);
        
        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes("TAVILY_API_KEY") || error.message.includes("API key")) {
                return "Could not fetch news: TAVILY_API_KEY is not configured correctly in the environment.";
            }
            if (error.message.includes("rate limit") || error.message.includes("429")) {
                return "Could not fetch news: Rate limit exceeded. Please try again later.";
            }
            if (error.message.includes("quota") || error.message.includes("limit")) {
                return "Could not fetch news: API quota exceeded. Please try again later.";
            }
        }
        
        return "Could not fetch news due to an internal error. Please try again.";
    }
}


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
    const searchResponse = await axiosInstance.get(searchUrl, { headers: { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }});
    const coin = searchResponse.data.coins[0];
    if (!coin) return null;
    const priceUrl = `${COINGECKO_API_BASE}/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true`;
    const priceResponse = await axiosInstance.get(priceUrl, { headers: { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }});
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
  if (!trimmedInput) return null;
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


// --- HTML Formatting Function ---
function formatFinancialAnalysisToHtml(analysis: FinancialAnalysisData, coin: CoinData): string {
    const tradeColor = analysis.tradeType?.toLowerCase() === 'short' ? 'text-rose-400' : 'text-emerald-400';
    const riskColor = analysis.riskLevel?.includes("Low") ? "text-green-400" : analysis.riskLevel?.includes("Medium") ? "text-amber-400" : "text-red-400";
    const priceString = analysis.price || `${coin.price}`;
    const priceParts = priceString.match(/([\d\.,M]+)\s*(\(.*\))?/);
    const mainPrice = priceParts ? `$${priceParts[1]}` : priceString;
    const changeString = priceParts && priceParts[2] ? priceParts[2] : (coin.change24h ? `(${(coin.change24h >= 0 ? '+' : '') + coin.change24h.toFixed(2)}%)` : '');
    const priceChangeColor = changeString.includes('+') ? 'text-emerald-400' : 'text-rose-400';
    const coinImageHtml = coin.imageUrl ? `<img src="${coin.imageUrl}" alt="${coin.symbol}" class="w-12 h-12 rounded-full ring-2 ring-blue-500/30" />` : `<div class="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center text-lg font-bold text-blue-300 ring-2 ring-blue-500/30">${coin.symbol}</div>`;
    const formatSummary = (summary: string) => summary.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');

    return `
    <div class="font-sans text-gray-300">
        <div class="flex items-center gap-4 mb-5">
            ${coinImageHtml}
            <div>
                <h1 class="text-2xl font-bold tracking-wide text-white">${analysis.coinName} (${analysis.coinSymbol})</h1>
                <p class="text-lg font-semibold text-gray-200">${mainPrice} <span class="${priceChangeColor}">${changeString}</span></p>
            </div>
        </div>
        <div class="mb-6">
            <h2 class="text-xl font-semibold text-blue-300 mb-3 border-b-2 border-blue-500/20 pb-2">Trade Plan: <span class="${tradeColor}">${analysis.tradeType}</span></h2>
            <div class="space-y-4">
                <div class="p-4 bg-gray-800/40 rounded-lg">
                    <p class="text-sm text-gray-400 font-medium mb-1">📈 Entry Strategy</p>
                    <p class="text-lg font-semibold ${tradeColor}">${analysis.entryStrategy}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-gray-800/40 rounded-lg">
                        <p class="text-sm text-gray-400 font-medium mb-1">🎯 Take Profit</p>
                        <p class="text-lg font-semibold text-emerald-400">${analysis.takeProfit}</p>
                    </div>
                    <div class="p-4 bg-gray-800/40 rounded-lg">
                        <p class="text-sm text-gray-400 font-medium mb-1">🛑 Stop Loss</p>
                        <p class="text-lg font-semibold text-rose-400">${analysis.stopLoss}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-6">
             <h2 class="text-xl font-semibold text-blue-300 mb-3 border-b-2 border-blue-500/20 pb-2">Position Details</h2>
             <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div class="p-3 bg-gray-800/40 rounded-lg">
                    <p class="text-sm text-gray-400 font-medium">⚖️ Leverage</p>
                    <p class="text-lg font-semibold text-amber-400">${analysis.leverage}</p>
                </div>
                <div class="p-3 bg-gray-800/40 rounded-lg">
                    <p class="text-sm text-gray-400 font-medium">⏳ Duration</p>
                    <p class="text-lg font-semibold text-violet-300">${analysis.duration}</p>
                </div>
                <div class="p-3 bg-gray-800/40 rounded-lg">
                    <p class="text-sm text-gray-400 font-medium">🔒 Risk Level</p>
                    <p class="text-lg font-semibold ${riskColor}">${analysis.riskLevel}</p>
                </div>
             </div>
        </div>
        <div class="mb-6">
            <h2 class="text-xl font-semibold text-blue-300 mb-3 border-b-2 border-blue-500/20 pb-2">📰 Fundamental Analysis</h2>
            <div class="text-gray-300/90 leading-relaxed space-y-3 prose prose-invert prose-p:my-0 prose-p:text-gray-300/90">${formatSummary(analysis.fundamentalSummary)}</div>
        </div>
        <div>
            <h2 class="text-xl font-semibold text-blue-300 mb-3 border-b-2 border-blue-500/20 pb-2">📈 Technical Analysis</h2>
            <div class="text-gray-300/90 leading-relaxed space-y-3 prose prose-invert prose-p:my-0 prose-p:text-gray-300/90">${formatSummary(analysis.technicalSummary)}</div>
        </div>
    </div>`;
}

// --- Main Handler ---
const messageSchema = z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string(), imageUrl: z.string().optional(), }));

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userInput = formData.get("input") as string;
    const imageFile = formData.get("image") as File | null;
    const messagesStr = formData.get("messages") as string;
    const messages = messageSchema.parse(JSON.parse(messagesStr || "[]"));

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash-latest",
      temperature: 0.4,
      apiKey: process.env.GOOGLE_API_KEY,
    });
    
    const chatHistory = messages.map(msg => {
        if (msg.role === 'user') return new HumanMessage(msg.content);
        return new AIMessage(msg.content);
    });

    let response;

    if (imageFile) {
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        const imageBase64 = imageBuffer.toString("base64");
        const messageContent: any[] = [{ type: "text", text: userInput || "Analyze this chart for a trading plan." }];
        messageContent.push({ type: "image_url", image_url: { url: `data:${imageFile.type};base64,${imageBase64}`},});
        const imageHumanMessage = new HumanMessage({ content: messageContent });
        const imagePrompt = ChatPromptTemplate.fromMessages([ SystemMessagePromptTemplate.fromTemplate(FINVERO_SYSTEM_PROMPT), new MessagesPlaceholder("chat_history"), imageHumanMessage]);
        const imageChain = imagePrompt.pipe(model);
        response = await imageChain.invoke({ chat_history: chatHistory, input: "" });
        const rawContent = response.content.toString().replace(/```json/g, "").replace(/```/g, "").trim();
        const analysisData = JSON.parse(rawContent) as FinancialAnalysisData;
        
        // This part is crucial for image analysis.
        // The AI determines the coin name and symbol. We use that for the display.
        // We create a placeholder CoinData object because we don't fetch external data for images.
        const coinDataFromImage: CoinData = { 
            name: analysisData.coinName, 
            symbol: analysisData.coinSymbol, 
            price: 0, // Price is determined by AI from the chart image itself
            change24h: null, 
            imageUrl: undefined 
        };
        analysisData.tradeType = analysisData.entryStrategy?.toLowerCase().includes("short") ? "Short" : "Long";
        const formattedHtml = formatFinancialAnalysisToHtml(analysisData, coinDataFromImage);
        return NextResponse.json({ content: formattedHtml });

    } else {
        const coinData = await getCoinData(userInput);
        if (!coinData) {
            return NextResponse.json({ content: "I couldn't identify a valid cryptocurrency. Please provide a CoinGecko/DexScreener link, a contract address, or a symbol like '$BTC'." });
        }
        
        // --- NEW CONDITIONAL SEARCH LOGIC ---
        let newsResults = await performWebSearchWithTavily(`${coinData.name} (${coinData.symbol}) cryptocurrency news and updates`);
        let fundamentalDataSource: string;

        if (newsResults) {
            fundamentalDataSource = `Asset-Specific News Found:\n${newsResults}`;
        } else {
            const generalMarketNews = await performWebSearchWithTavily(`cryptocurrency market news and sentiment today`);
            if (generalMarketNews) {
                fundamentalDataSource = `No specific news was found for ${coinData.name}.
                \n\nGeneral Market News:\n${generalMarketNews}`;
            } else {
                fundamentalDataSource = "No specific or general market news could be retrieved. The analysis must be purely technical.";
            }
        }
        // --- END OF NEW LOGIC ---

        const marketData = `Current data for ${coinData.name} (${coinData.symbol}): Price is $${coinData.price}, 24h change is ${coinData.change24h?.toFixed(2) ?? 'N/A'}%.`;
        const fullInput = `User Query: ${userInput}\n\nTechnical Data:\n${marketData}\n\nFundamental Data:\n${fundamentalDataSource}`;

        const prompt = ChatPromptTemplate.fromMessages([ SystemMessagePromptTemplate.fromTemplate(FINVERO_SYSTEM_PROMPT), new MessagesPlaceholder("chat_history"), HumanMessagePromptTemplate.fromTemplate("{input}"), ]);
        const chain = prompt.pipe(model);
        response = await chain.invoke({
          chat_history: chatHistory,
          input: fullInput,
        });
    
        const rawContent = response.content.toString().replace(/```json/g, "").replace(/```/g, "").trim();
        const analysisData = JSON.parse(rawContent) as FinancialAnalysisData;
        analysisData.tradeType = analysisData.entryStrategy?.toLowerCase().includes("short") ? "Short" : "Long";
        const formattedHtml = formatFinancialAnalysisToHtml(analysisData, coinData);
        return NextResponse.json({ content: formattedHtml });
    }

  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: "An error occurred during analysis.", details: errorMessage }, { status: 500 });
  }
}