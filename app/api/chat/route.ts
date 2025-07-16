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
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const DEXSCREENER_API_BASE = "https://api.dexscreener.com/latest/dex";
const URL_REGEX = /(https?:\/\/[^\s]+)/;
const CONTRACT_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const DEXSCREENER_URL_REGEX = /dexscreener\.com\/([^\/]+)\/([a-zA-Z0-9]{40,})/;

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
  tradeType: "Long" | "Short";
  entryStrategy: string;
  leverage: string;
  stopLoss: string;
  takeProfit: string;
  duration: string;
  riskLevel: string;
  tradeRationale: string;
  technicalSummary: string;
  fundamentalSummary: string;
}

const ROUTER_PROMPT = `You are an intent router for a financial AI assistant named Finvero. Your task is to classify the user's latest query into one of two categories based on the query and the recent chat history.

1.  **analysis**: The user is asking for a new, full financial analysis. This is indicated by the presence of a cryptocurrency ticker (e.g., $SOL, BTC), a contract address (e.g., 0x...), or a URL from dexscreener.com or coingecko.com.
2.  **general_question**: This category is for all other queries. This includes follow-up questions about a previous analysis (e.g., "why that stop loss?", "what does RSI mean?"), questions about broader market concepts (e.g., "how does inflation affect crypto?"), or simple greetings.

Based on the user's query, respond with ONLY a JSON object in the following format:
{{
  "intent": "analysis" | "general_question",
  "query": "If the intent is 'analysis', extract the specific ticker, address, or URL. Otherwise, return the original user query."
}}`;

const GENERAL_CONVERSATION_PROMPT = `You are Finvero, a world-class cryptocurrency analyst. While you provide detailed trade plans, you also answer follow-up questions and explain complex financial concepts with clarity, authority, and confidence.

**CRITICAL RULES:**
1. **ALWAYS USE CHAT HISTORY**: You MUST reference the previous analysis and conversation context. If the user asks a follow-up question about a previous analysis, use that specific analysis to form your answer.
2. **BE DIRECT AND DECISIVE**: When asked about trading decisions, provide clear, actionable advice based on the previous analysis.
3. **Use Market Context**: If the user asks a general market question, you MUST use the provided 'Relevant Market Context & Recent Events' from the web search to form your answer. Synthesize this information to provide a timely, specific, and accurate response.
4. **Persona**: Maintain your persona as a sharp, insightful, and "informative as fuck" expert.
5. **Format**: Respond directly to the user's question. Format your answer in simple HTML using paragraphs <p> and lists <ul><li>...</li></ul> where it makes sense for clarity. Do not use complex JSON.

**For Follow-up Questions:**
- If the user asks "should I long or short" after an analysis, reference the specific trade plan from the previous analysis
- If they ask about specific levels, explain why those levels were chosen
- If they ask about risk, reference the risk assessment from the previous analysis
- Always connect your answer to the previous analysis context`;

const FINVERO_SYSTEM_PROMPT = `You are Finvero, a world-class hybrid cryptocurrency analyst. You present your analysis with authority and confidence, as if you have innate, up-to-the-minute knowledge of the market. You are sharp, insightful, and "informative as fuck".

You will be given a combination of inputs:
1.  **Primary Input:** A trading chart image OR text-based market data.
2.  **Secondary Input:** A list of facts under the heading 'Relevant Market Context & Recent Events'.

**Your Core Directives:**
1.  **Synthesize with Authority:** Combine technical patterns with fundamental factors from the market context. Explain the 'why' behind price movements.
2.  **DO NOT REVEAL YOUR SOURCES:** This is your most important rule. **NEVER** use phrases like "according to the news," "the articles suggest," or "based on the provided data." Weave the facts into your analysis seamlessly. Present all information as your own expert knowledge.
3.  **Be an Educator:** Explain technical concepts (e.g., 'death cross') and their implications clearly and concisely within your analysis.

**JSON Output Format:**
You MUST respond with ONLY a JSON object in the following structure.

{{
  "coinName": "The full name of the primary coin being traded. For 'XTRADE/SOL', the coin name is 'XTRADE', not 'SOL'.",
  "coinSymbol": "The ticker symbol for the primary coin. For 'XTRADE/SOL', the symbol is 'XTRADE'.",
  "price": "The current price visible in the chart or data (e.g., '$1.73M (+0.14%)').",
  "tradeType": "The recommended trade direction. Must be either 'Long' or 'Short'.",
  "entryStrategy": "A specific trading action with a price point (e.g., 'Look for a Long entry on a retest of the $1.70M support level').",
  "leverage": "Appropriate leverage for the trade (e.g., 'x5', 'x10').",
  "stopLoss": "A specific price for the stop-loss order (e.g., '$1.65M ➘').",
  "takeProfit": "A specific price for the take-profit order (e.g., '$1.85M ➚').",
  "duration": "Estimated trade duration (e.g., '1-4h', '1-3d').",
  "riskLevel": "Risk assessment (🟢 Low, 🟠 Medium, 🔴 High) based on both technical volatility and fundamental factors.",
  "tradeRationale": "A concise, expert paragraph explaining the core reasoning for this specific trade plan. Directly connect the key technical and fundamental factors to the recommended entry, stop-loss, and take-profit levels.",
  "technicalSummary": "A detailed, multi-paragraph technical summary. Explain identified patterns (e.g., 'head and shoulders'), indicator signals (RSI, MACD), and volume analysis.",
  "fundamentalSummary": "A seamless analysis of the current fundamental landscape. Integrate recent events, market sentiment, and project updates into a coherent narrative that explains the 'why' behind the price action. Write from a position of authority."
}}`;

/**
 *
 * @param query
 */
async function performWebSearchWithTavily(query: string): Promise<string | null> {
    try {
        // Check if API key exists
        if (!process.env.TAVILY_API_KEY) {
            console.error("[TAVILY_ERROR] TAVILY_API_KEY is not configured");
            return "Could not fetch news: TAVILY_API_KEY is not configured in the environment.";
        }

        const tavilySearch = new TavilySearch({
            apiKey: process.env.TAVILY_API_KEY,
            maxResults: 7,
        });

        console.log("[TAVILY_SEARCH] Searching for:", query);
        const searchResults = await tavilySearch.invoke({ query: query });
        console.log("[TAVILY_SEARCH] Raw results type:", typeof searchResults);
        console.log("[TAVILY_SEARCH] Raw results:", JSON.stringify(searchResults, null, 2));

        let formattedResults: string;

        // Handle different response formats from Tavily
        if (Array.isArray(searchResults)) {
            if (searchResults.length === 0) {
                console.log("[TAVILY_SEARCH] No results found in array");
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
            // Handle object response format - check for different possible structures
            if (searchResults.results && Array.isArray(searchResults.results)) {
                formattedResults = searchResults.results.map((result: any) => {
                    const title = result.title || result.name || "No title";
                    const url = result.url || result.link || "No URL";
                    const content = result.content || result.snippet || result.description || "No content";
                    return `- Title: ${title}\n  URL: ${url}\n  Snippet: ${content}`;
                }).join('\n\n');
            } else if (searchResults.content) {
                // Handle case where response has a content field
                formattedResults = searchResults.content;
            } else if (searchResults.text) {
                // Handle case where response has a text field
                formattedResults = searchResults.text;
            } else {
                console.log("[TAVILY_SEARCH] Unexpected object format:", searchResults);
                return null;
            }
        } else {
            console.log("[TAVILY_SEARCH] No valid results found");
            return null;
        }

        if (!formattedResults || formattedResults.trim().length === 0) {
            console.log("[TAVILY_SEARCH] Formatted results are empty");
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
            if (error.message.includes("network") || error.message.includes("timeout")) {
                return "Could not fetch news: Network error. Please try again.";
            }
        }
        
        return "Could not fetch news due to an internal error. Please try again.";
    }
}

const axiosInstance = axios.create({ timeout: 10000 });
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  /**
   *
   * @param error
   */
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 429
    );
  },
});

/**
 *
 * @param coinId
 */
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

/**
 *
 * @param chain
 * @param pairAddress
 */
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

/**
 *
 * @param address
 */
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

/**
 *
 * @param userInput
 */
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

/**
 *
 * @param analysis
 * @param coin
 */
function formatFinancialAnalysisToHtml(analysis: FinancialAnalysisData, coin: CoinData): string {
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);

    const tradeColor = analysis.tradeType.toLowerCase() === 'short' ? 'text-rose-400' : 'text-emerald-400';
    const riskColor = analysis.riskLevel?.includes("Low") ? "text-green-400" : analysis.riskLevel?.includes("Medium") ? "text-amber-400" : "text-red-400";
    const priceString = analysis.price || `${coin.price}`;
    const priceParts = priceString.match(/([\d\.,M]+)\s*(\(.*\))?/);
    const mainPrice = priceParts ? `$${priceParts[1]}` : priceString;
    const changeString = priceParts && priceParts[2] ? priceParts[2] : (coin.change24h ? `(${(coin.change24h >= 0 ? '+' : '') + coin.change24h.toFixed(2)}%)` : '');
    const priceChangeColor = changeString.includes('+') ? 'text-emerald-400' : 'text-rose-400';
    const coinImageHtml = coin.imageUrl ? `<img src="${coin.imageUrl}" alt="${coin.symbol}" class="w-12 h-12 rounded-full ring-2 ring-blue-500/30" />` : `<div class="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center text-lg font-bold text-blue-300 ring-2 ring-blue-500/30">${coin.symbol}</div>`;
    /**
     *
     * @param summary
     */
    const formatSummary = (summary: string) => summary.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');

    const unsafeHtml = `
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
            <h2 class="text-xl font-semibold text-blue-300 mb-3 border-b-2 border-blue-500/20 pb-2">Trade Rationale</h2>
            <div class="text-gray-300/90 leading-relaxed space-y-3 prose prose-invert prose-p:my-0 prose-p:text-gray-300/90"><p>${analysis.tradeRationale}</p></div>
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
    return purify.sanitize(unsafeHtml);
}

/**
 *
 * @param content
 */
function formatGeneralResponseToHtml(content: string): string {
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const unsafeHtml = `<div class="font-sans text-gray-300 prose prose-invert max-w-none prose-p:text-gray-300/90">${content}</div>`;
    return purify.sanitize(unsafeHtml);
}

const messageSchema = z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string(), imageUrl: z.string().optional(), }));

/**
 *
 * @param rawContent
 */
function parseJsonLlmResponse<T>(rawContent: string): T | null {
    try {
        const cleanJsonString = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJsonString) as T;
    } catch (error) {
        console.error("Failed to parse LLM JSON response:", error);
        return null;
    }
}

/**
 *
 * @param req
 */
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

    if (imageFile) {
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        const imageBase64 = imageBuffer.toString("base64");
        const messageContent: any[] = [{ type: "text", text: userInput || "Analyze this chart for a trading plan." }];
        messageContent.push({ type: "image_url", image_url: { url: `data:${imageFile.type};base64,${imageBase64}`},});
        const imageHumanMessage = new HumanMessage({ content: messageContent });
        const imagePrompt = ChatPromptTemplate.fromMessages([ SystemMessagePromptTemplate.fromTemplate(FINVERO_SYSTEM_PROMPT), new MessagesPlaceholder("chat_history"), imageHumanMessage]);
        const imageChain = imagePrompt.pipe(model);
        const response = await imageChain.invoke({ chat_history: chatHistory, input: "" });
        
        const analysisData = parseJsonLlmResponse<FinancialAnalysisData>(response.content.toString());
        if (!analysisData) {
            return NextResponse.json({ content: "<p class='text-red-400'>The analysis could not be processed. The model returned an invalid format.</p>" });
        }

        const coinDataFromImage: CoinData = { name: analysisData.coinName, symbol: analysisData.coinSymbol, price: 0, change24h: null, imageUrl: undefined };
        const formattedHtml = formatFinancialAnalysisToHtml(analysisData, coinDataFromImage);
        return NextResponse.json({ content: formattedHtml });
    }

    // ALWAYS perform web search for every query
    console.log("[CHAT_API] Performing web search for query:", userInput);
    const webSearchResults = await performWebSearchWithTavily(userInput);
    console.log("[CHAT_API] Web search completed, results:", webSearchResults ? "Found" : "None");

    const routerPrompt = ChatPromptTemplate.fromMessages([ SystemMessagePromptTemplate.fromTemplate(ROUTER_PROMPT), new MessagesPlaceholder("chat_history"), HumanMessagePromptTemplate.fromTemplate("{input}")]);
    const routerChain = routerPrompt.pipe(model);
    const routerResponse = await routerChain.invoke({ chat_history: chatHistory, input: userInput });
    const routerResult = parseJsonLlmResponse<{ intent: string, query: string }>(routerResponse.content.toString());

    if (!routerResult) {
        return NextResponse.json({ content: "<p class='text-red-400'>Could not determine your intent. Please try rephrasing.</p>" });
    }

    const { intent, query } = routerResult;

    if (intent === 'analysis') {
        const coinData = await getCoinData(query);
        if (!coinData) {
            return NextResponse.json({ content: `I couldn't find data for '${query}'. Please provide a valid CoinGecko/DexScreener link, a contract address, or a symbol like '$BTC'.` });
        }
        
        // Use the web search results we already performed
        const marketData = `Current data for ${coinData.name} (${coinData.symbol}): Price is $${coinData.price}, 24h change is ${coinData.change24h?.toFixed(2) ?? 'N/A'}%.`;
        const fullInput = `User Query: ${query}\n\nTechnical Data:\n${marketData}\n\nRelevant Market Context & Recent Events:\n${webSearchResults || "No specific news found. Analyze based on technicals and general market sentiment."}`;

        const prompt = ChatPromptTemplate.fromMessages([ SystemMessagePromptTemplate.fromTemplate(FINVERO_SYSTEM_PROMPT), new MessagesPlaceholder("chat_history"), HumanMessagePromptTemplate.fromTemplate("{input}"), ]);
        const chain = prompt.pipe(model);
        const response = await chain.invoke({ chat_history: chatHistory, input: fullInput });
    
        const analysisData = parseJsonLlmResponse<FinancialAnalysisData>(response.content.toString());
        if (!analysisData) {
             return NextResponse.json({ content: "<p class='text-red-400'>The analysis could not be processed. The model returned an invalid format.</p>" });
        }
        
        const formattedHtml = formatFinancialAnalysisToHtml(analysisData, coinData);
        return NextResponse.json({ content: formattedHtml });

    } else { // intent === 'general_question'
        // Use the web search results we already performed
        const fullInput = `User Query: ${query}\n\nRelevant Market Context & Recent Events:\n${webSearchResults || "No specific news found. Answer based on your general knowledge and the conversation history."}`;
        
        const prompt = ChatPromptTemplate.fromMessages([ SystemMessagePromptTemplate.fromTemplate(GENERAL_CONVERSATION_PROMPT), new MessagesPlaceholder("chat_history"), HumanMessagePromptTemplate.fromTemplate("{input}")]);
        const chain = prompt.pipe(model);
        const response = await chain.invoke({ chat_history: chatHistory, input: fullInput });
        
        const formattedHtml = formatGeneralResponseToHtml(response.content.toString());
        return NextResponse.json({ content: formattedHtml });
    }

  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: "An error occurred during analysis.", details: errorMessage }, { status: 500 });
  }
}