"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [blockedChunks, setBlockedChunks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      setResponse(data.answer);
      setChunks(data.chunks || []);
      setBlockedChunks(data.blocked_chunks || []);
    } catch (error) {
      setError("Backend Unavailable");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 p-6">

        {/* Header */}
        <div className="mb-6 border-b border-zinc-700 pb-4">
          <h1 className="text-4xl font-bold text-center text-blue-400">
            RAG Firewall
          </h1>

          <p className="text-center text-zinc-400 mt-2">
            Retrieval-Augmented Generation Security System
          </p>
        </div>

        {/* Input Section */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            disabled={loading}
            placeholder="Ask something..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendQuery();
            }}
            className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-400 outline-none focus:border-blue-500"
          />

          <button
            onClick={sendQuery}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-xl font-semibold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                <span>Generating response...</span>
              </div>
            ) : (
              "Send"
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-700 text-red-300 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* Answer Section */}
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>

            <h2 className="text-2xl font-bold text-blue-400">
              AI Response
            </h2>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-zinc-200 text-lg leading-8 whitespace-pre-wrap">
              {response || "Your response will appear here..."}
            </p>
          </div>
        </div>

        {/* Retrieved Chunks */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>

            <h2 className="text-2xl font-bold text-green-400">
              Retrieved Chunks
            </h2>
          </div>

          <div className="space-y-4">
            {chunks.length > 0 ? (
              chunks.map((chunk, index) => (
                <div
                  key={index}
                  className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-blue-400">
                      Chunk {index + 1}
                    </span>

                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
                      Risk Score: Pending
                    </span>
                  </div>

                  <p className="text-zinc-300 leading-7 whitespace-pre-wrap mb-4">
                    {chunk}
                  </p>

                  <div className="border-t border-zinc-700 pt-3 text-sm text-zinc-400">
                    Source: Pending
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500">
                No chunks retrieved yet.
              </p>
            )}
          </div>
        </div>

        {/* Blocked Chunks */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>

            <h2 className="text-2xl font-bold text-red-400">
              Blocked Chunks
            </h2>
          </div>

          <div className="space-y-4">
            {blockedChunks.length > 0 ? (
              blockedChunks.map((chunk, index) => (
                <div
                  key={index}
                  className="bg-red-950 border border-red-700 rounded-2xl p-5 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-red-300">
                      Blocked Chunk {index + 1}
                    </span>

                    <span className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full">
                      Blocked
                    </span>
                  </div>

                  <p className="text-red-200 leading-7 whitespace-pre-wrap">
                    {chunk}
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5">
                <p className="text-zinc-400">
                  No blocked chunks
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

