"use client";

import React, { useState, useEffect } from "react";

const PASSWORD = "oncha123";
const STORAGE_KEY = "site_authenticated";

export default function PasswordGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authed = localStorage.getItem(STORAGE_KEY);
      if (authed === "true") setAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      setAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, "true");
    } else {
      setError("Incorrect password");
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#01010e]">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-8 rounded-xl shadow-lg flex flex-col gap-4 w-full max-w-xs"
      >
        <h2 className="text-white text-xl font-bold text-center">
          Enter Password
        </h2>
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          className="px-4 py-2 rounded bg-white/20 text-white focus:outline-none"
          placeholder="Password"
        />
        {error && (
          <div className="text-red-400 text-sm text-center">{error}</div>
        )}
        <button
          type="submit"
          className="bg-white text-black px-4 py-2 rounded font-medium"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
