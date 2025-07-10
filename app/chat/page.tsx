"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  PlusCircle,
  Image,
  Mic,
  ArrowUpRight,
  Wind,
  Loader,
  X,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  isFormatted?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  ˀz;
  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      ``;
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    const canSendMessage = (input.trim() || imageFile) && !isLoading;
    if (!canSendMessage) return;

    const currentInput = input;
    const currentImageFile = imageFile;
    const currentImagePreview = imagePreview;
    const previousMessages = messages;

    const userMessage: Message = {
      role: "user",
      content: currentInput,
      imageUrl: currentImagePreview || undefined,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    removeImage();
    setIsLoading(true);

    setTimeout(() => scrollToBottom("auto"), 0);

    try {
      const formData = new FormData();
      formData.append("input", currentInput);
      formData.append("messages", JSON.stringify(previousMessages));
      if (currentImageFile) {
        formData.append("image", currentImageFile);
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantResponse = data.content;
      const isFormatted = /<[a-z][\s\S]*>/i.test(assistantResponse);

      if (isFormatted) {
        const assistantMessage: Message & { isFormatted?: boolean } = {
          role: "assistant",
          content: assistantResponse,
          isFormatted: true,
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        setIsLoading(false);
      } else {
        const assistantMessagePlaceholder: Message & { isFormatted?: boolean } =
          {
            role: "assistant",
            content: "",
            isFormatted: false,
          };
        setMessages((prevMessages) => [
          ...prevMessages,
          assistantMessagePlaceholder,
        ]);

        let index = 0;
        const intervalId = setInterval(() => {
          setMessages((prev) => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg.role === "assistant") {
              lastMsg.content = assistantResponse.slice(0, index + 1);
            }
            return newMsgs;
          });

          index++;

          if (index >= assistantResponse.length) {
            clearInterval(intervalId);
            setIsLoading(false);
          }
        }, 20);
      }
    } catch (error) {
      console.error("Failed to get response:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "<p class='text-red-400'>Sorry, I encountered an error. Please check the console or try again.</p>",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setIsLoading(false);
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showLoader = isLoading && (!lastMessage || lastMessage.role === "user");

  return (
    <div className="bg-[#01010e] min-h-screen w-full flex flex-col font-sans text-gray-300">
      <div className="flex-grow flex flex-col w-full max-w-5xl mx-auto mt-8 sm:mt-20 px-2 sm:px-0">
        {messages.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center px-2">
            <div className="bg-white p-3 rounded-xl shadow-lg mb-6">
              <Wind className="text-[#121212] h-8 w-8" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Welcome to Predictive Pulse
            </h2>
            <p className="max-w-md text-gray-400 text-base sm:text-lg">
              I analyze market data to spot trading opportunities. Give me a
              coin ticker (e.g., $SOL), a contract address, a DexScreener link,
              or upload an image to get started.
            </p>
          </div>
        ) : (
          <div
            ref={chatContainerRef}
            className="w-full flex-grow overflow-y-auto py-4 scroll-smooth"
            style={{ scrollBehavior: "smooth" }}
          >
            <div className="flex flex-col gap-3 sm:gap-4 px-1 sm:px-0">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 sm:p-4 rounded-lg max-w-[90vw] sm:max-w-xl text-sm sm:text-base ${
                      msg.role === "user"
                        ? "bg-blue-600/30 text-white"
                        : "bg-[#1a1a24] text-gray-300"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      msg.isFormatted ? (
                        <div
                          className="prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: msg.content }}
                        />
                      ) : (
                        <div className="whitespace-pre-line">{msg.content}</div>
                      )
                    ) : (
                      <>
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="User upload"
                            className="rounded-lg mb-2 max-w-[60vw] sm:max-w-xs"
                          />
                        )}
                        {msg.content}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {showLoader && (
                <div className="flex justify-start">
                  <div className="p-3 sm:p-4 rounded-lg bg-[#1a1a24] text-gray-300">
                    <Loader className="animate-spin h-5 w-5 text-blue-400" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="w-full flex flex-col items-center pt-4 pb-6 sticky bottom-0 bg-[#01010e] px-2 sm:px-0">
        <div className="w-full max-w-5xl">
          {imagePreview && (
            <div className="relative inline-block mb-2">
              <img
                src={imagePreview}
                alt="Selected preview"
                className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-white hover:bg-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
            />
            <div className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 flex items-center space-x-2 sm:space-x-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-white disabled:opacity-50 p-2 sm:p-0"
                disabled={isLoading}
                aria-label="Upload image"
              >
                <Image className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about an image or analyze $ETH, a contract address..."
              className="w-full bg-[#282828] border border-gray-700 rounded-full py-3 sm:py-4 pl-12 sm:pl-13 pr-14 sm:pr-16 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base sm:text-lg"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <button
                type="submit"
                className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-full text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-lg"
                disabled={(!input.trim() && !imageFile) || isLoading}
                aria-label="Send message"
              >
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
        <p className="text-xs text-gray-600 mt-3 text-center px-2">
          Predictive Pulse AI may produce incorrect analysis. Always do your own
          research.
        </p>
      </footer>
    </div>
  );
}
