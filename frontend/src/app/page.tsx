"use client";

import { useState } from "react";

type SafeChunk = { text: string; risk_score: number };
type BlockedChunk = { text: string; matches: string[]; risk_score: number };

// Type system: Space Grotesk carries the brand and mode identity,
// JetBrains Mono carries anything that came out of the security layer
// (scores, flagged tokens, status text) — prose stays in the default sans.
const fontDisplay = "'Space Grotesk', ui-sans-serif, sans-serif";
const fontMono = "'JetBrains Mono', ui-monospace, monospace";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [chunks, setChunks] = useState<SafeChunk[]>([]);
  const [blockedChunks, setBlockedChunks] = useState<BlockedChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Retrieval Mode (visual only — backend always runs Hybrid retrieval)
  const [retrievalMode] = useState("Hybrid");

  const hasResult = response !== "" || chunks.length > 0 || blockedChunks.length > 0;
  const scannedCount = chunks.length + blockedChunks.length;

  const sendQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <main className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-6 relative overflow-hidden">

        {/* Grid background */}
        <div className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient blobs */}
        <div className="fixed top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none animate-pulse motion-reduce:animate-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)" }}
        />
        <div className="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)",
            animation: "pulse 10s ease-in-out infinite",
          }}
        />

        {/* Main card */}
        <div className="relative z-10 w-full max-w-4xl">
          <div
            className="relative rounded-[28px] p-8 transition-all duration-500 group/card"
            style={{
              background: "rgba(17,17,27,0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Top shimmer line */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px rounded-full pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(99,179,255,0.4), transparent)" }}
            />

            {/* Header */}
            <div className="mb-6 pb-7 border-b border-white/[0.05] text-center">
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase"
                  style={{
                    fontFamily: fontMono,
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.22)",
                    color: "#60a5fa",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse motion-reduce:animate-none"
                    style={{ boxShadow: "0 0 6px #60a5fa" }}
                  />
                  Security Layer Active
                </span>
              </div>

              <h1 className="text-[42px] font-bold tracking-[-1.5px] leading-none"
                style={{
                  fontFamily: fontDisplay,
                  background: "linear-gradient(135deg, #fff 0%, #bfdbfe 50%, #60a5fa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                RAG Firewall
              </h1>

              <p className="text-zinc-500 text-[13px] mt-2.5 tracking-wide">
                Retrieval-Augmented Generation Security System
              </p>

              {/* Live stats strip */}
              <div className="flex justify-center gap-6 mt-5">
                {[
                  { label: "Scanned", value: scannedCount, color: "#93c5fd" },
                  { label: "Passed", value: chunks.length, color: "#34d399" },
                  { label: "Blocked", value: blockedChunks.length, color: "#f87171" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center">
                    <span
                      className="text-lg font-semibold"
                      style={{ fontFamily: fontMono, color: hasResult ? stat.color : "#3f3f4a" }}
                    >
                      {hasResult ? stat.value : "—"}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-600 mt-0.5">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Retrieval Mode */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-2 h-2 rounded-full bg-blue-400"
                  style={{ boxShadow: "0 0 10px rgba(96,165,250,0.9)" }}
                />
                <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-blue-400" style={{ fontFamily: fontMono }}>
                  Retrieval Mode
                </h2>
              </div>

              {/* Hybrid — active, full width */}
              <button
                type="button"
                aria-pressed="true"
                className="relative w-full text-left rounded-[18px] p-5 mb-4 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                style={{
                  background: "rgba(37,99,235,0.12)",
                  border: "1px solid rgba(96,165,250,0.28)",
                  boxShadow: "0 0 25px rgba(37,99,235,0.12)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-lg font-semibold" style={{ fontFamily: fontDisplay }}>
                      {retrievalMode}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-1">
                      Dense semantic retrieval combined with CrossEncoder reranking.
                    </p>
                  </div>

                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-semibold shrink-0"
                    style={{
                      fontFamily: fontMono,
                      background: "rgba(52,211,153,0.12)",
                      color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.2)",
                    }}
                  >
                    ● Active
                  </span>
                </div>
              </button>

              {/* Upcoming modes */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="rounded-[18px] p-4 opacity-60 cursor-not-allowed text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  style={{
                    background: "rgba(24,24,38,0.45)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-semibold" style={{ fontFamily: fontDisplay }}>
                      Dense
                    </h3>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider" style={{ fontFamily: fontMono }}>
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm">
                    Pure embedding-based vector retrieval.
                  </p>
                </button>

                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="rounded-[18px] p-4 opacity-60 cursor-not-allowed text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  style={{
                    background: "rgba(24,24,38,0.45)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-semibold" style={{ fontFamily: fontDisplay }}>
                      BM25
                    </h3>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider" style={{ fontFamily: fontMono }}>
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm">
                    Traditional keyword-based sparse retrieval.
                  </p>
                </button>
              </div>
            </div>

            {/* Input Section */}
            <div className="flex gap-3 mb-8">
              <div className="relative flex-1 group/input">
                <input
                  type="text"
                  disabled={loading}
                  placeholder="Ask something..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendQuery(); }}
                  className="w-full py-3.5 px-5 rounded-[16px] text-white text-sm outline-none transition-all duration-250 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-400/40"
                  style={{
                    background: "rgba(39,39,55,0.6)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    caretColor: "#60a5fa",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "rgba(39,39,55,0.9)";
                    e.target.style.borderColor = "rgba(59,130,246,0.45)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1), 0 0 20px rgba(59,130,246,0.05)";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(39,39,55,0.6)";
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <button
                onClick={sendQuery}
                disabled={loading}
                className="relative px-7 py-3.5 rounded-[16px] font-semibold text-sm text-white overflow-hidden transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                style={{
                  background: "#2563eb",
                  boxShadow: "0 0 20px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 40px rgba(37,99,235,0.7), 0 0 80px rgba(37,99,235,0.2), inset 0 1px 0 rgba(255,255,255,0.2)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#2563eb";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                {/* Shimmer overlay */}
                <span className="absolute inset-0 rounded-[16px] pointer-events-none"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%)" }}
                />
                <span className="relative">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin motion-reduce:animate-none" />
                      Generating...
                    </span>
                  ) : "Send →"}
                </span>
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 rounded-2xl p-4 mb-6 text-sm"
                style={{
                  background: "rgba(220,38,38,0.07)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  color: "#f87171",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0 animate-pulse motion-reduce:animate-none" />
                {error}
              </div>
            )}

            {/* AI Response */}
            <div className="mb-7">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"
                  style={{ boxShadow: "0 0 10px rgba(96,165,250,0.9)" }}
                />
                <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-blue-400" style={{ fontFamily: fontMono }}>
                  AI Response
                </h2>
              </div>

              <div
                className="relative rounded-[20px] p-6 pl-7 overflow-hidden transition-all duration-300 cursor-default group/ai"
                style={{
                  background: "rgba(30,30,46,0.5)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(96,165,250,0.25)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(30,30,46,0.75)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 40px rgba(59,130,246,0.07), inset 0 0 30px rgba(59,130,246,0.02)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(30,30,46,0.5)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                {/* Left accent line */}
                <span className="absolute left-0 top-[15%] bottom-[15%] w-[2px] rounded-r-full transition-all duration-300"
                  style={{ background: "linear-gradient(180deg, transparent, rgba(96,165,250,0.6), transparent)" }}
                />
                <p className="text-zinc-300 text-[15px] leading-8 whitespace-pre-wrap">
                  {response || <span className="text-zinc-600 italic text-sm">Your response will appear here...</span>}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)" }}
            />

            {/* Retrieved Chunks */}
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
                  style={{ boxShadow: "0 0 10px rgba(52,211,153,0.9)" }}
                />
                <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-emerald-400" style={{ fontFamily: fontMono }}>
                  Retrieved Chunks
                </h2>
                {chunks.length > 0 && (
                  <span className="ml-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ fontFamily: fontMono, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}
                  >
                    {chunks.length}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {chunks.length > 0 ? chunks.map((chunk, index) => {
                  return (
                    <div
                      key={index}
                      className="relative rounded-[18px] p-5 overflow-hidden transition-all duration-[280ms] cursor-default group/chunk"
                      style={{
                        background: "rgba(24,24,38,0.5)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderColor = "rgba(52,211,153,0.28)";
                        el.style.background = "rgba(24,24,38,0.85)";
                        el.style.transform = "translateY(-2px)";
                        el.style.boxShadow = "0 10px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(52,211,153,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderColor = "rgba(255,255,255,0.06)";
                        el.style.background = "rgba(24,24,38,0.5)";
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "none";
                      }}
                    >
                      {/* Left hover accent */}
                      <span className="absolute left-0 top-[18%] bottom-[18%] w-[2px] rounded-r-full transition-all duration-300 opacity-0 group-hover/chunk:opacity-100"
                        style={{ background: "linear-gradient(180deg, transparent, rgba(52,211,153,0.8), transparent)" }}
                      />
                      {/* Top glow on hover */}
                      <span className="absolute inset-x-0 top-0 h-px opacity-0 group-hover/chunk:opacity-100 transition-opacity duration-300"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)" }}
                      />

                      <p className="text-zinc-400 text-[13px] leading-7 whitespace-pre-wrap mb-4">
                        {chunk.text}
                      </p>

                      <div className="flex items-center justify-between border-t border-white/[0.08] pt-3">
                        <span
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={{
                            fontFamily: fontMono,
                            background: "rgba(251,191,36,0.1)",
                            border: "1px solid rgba(251,191,36,0.2)",
                            color: "#fbbf24",
                          }}
                        >
                          Risk: {chunk.risk_score.toFixed(2)}
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-zinc-500" style={{ fontFamily: fontMono }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                          Source — coming soon
                        </span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-zinc-600 text-sm py-1 pl-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    No chunks retrieved yet.
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)" }}
            />

            {/* Blocked Chunks */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"
                  style={{ boxShadow: "0 0 10px rgba(248,113,113,0.9)" }}
                />
                <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-red-400" style={{ fontFamily: fontMono }}>
                  Blocked Chunks
                </h2>
                {blockedChunks.length > 0 && (
                  <span className="ml-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ fontFamily: fontMono, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}
                  >
                    {blockedChunks.length}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {blockedChunks.length > 0 ? blockedChunks.map((chunk, index) => {
                  return (
                    <div
                      key={index}
                      className="relative rounded-[18px] p-5 overflow-hidden transition-all duration-[280ms] cursor-default group/blocked"
                      style={{
                        background: "rgba(28,10,10,0.6)",
                        border: "1px solid rgba(248,113,113,0.12)",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderColor = "rgba(248,113,113,0.32)";
                        el.style.transform = "translateY(-2px)";
                        el.style.boxShadow = "0 10px 40px rgba(220,38,38,0.18), 0 0 0 1px rgba(248,113,113,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderColor = "rgba(248,113,113,0.12)";
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "none";
                      }}
                    >
                      {/* Inner red gradient */}
                      <span className="absolute inset-0 pointer-events-none"
                        style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.08) 0%, transparent 55%)" }}
                      />
                      {/* Top shimmer on hover */}
                      <span className="absolute inset-x-0 top-0 h-px opacity-0 group-hover/blocked:opacity-100 transition-opacity duration-300"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(248,113,113,0.35), transparent)" }}
                      />

                      <div className="relative flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-red-400/70 uppercase tracking-[0.1em]" style={{ fontFamily: fontMono }}>
                          Blocked Chunk {index + 1}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.22)", color: "#f87171" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse motion-reduce:animate-none" />
                          Blocked
                        </span>
                      </div>

                      <div className="relative">
                        {chunk.matches.length > 0 && (
                          <div className="mb-3">
                            <span className="text-[10px] uppercase tracking-[0.12em] text-red-400/50 block mb-1.5" style={{ fontFamily: fontMono }}>
                              Detected Patterns
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {chunk.matches.map((m, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 rounded-md text-[10.5px]"
                                  style={{
                                    fontFamily: fontMono,
                                    background: "rgba(248,113,113,0.08)",
                                    border: "1px solid rgba(248,113,113,0.18)",
                                    color: "#fca5a5",
                                  }}
                                >
                                  ⚠ {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-red-300/60 text-[13px] leading-7 whitespace-pre-wrap mb-3">
                          {chunk.text}
                        </p>

                        <span
                          className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={{
                            fontFamily: fontMono,
                            background: "rgba(251,191,36,0.1)",
                            border: "1px solid rgba(251,191,36,0.2)",
                            color: "#fbbf24",
                          }}
                        >
                          Risk: {chunk.risk_score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="rounded-[18px] p-5 flex items-center gap-2 text-zinc-600 text-[13px]"
                    style={{ background: "rgba(17,17,27,0.3)", border: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    No blocked chunks
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Footer */}
          <p className="text-center text-zinc-800 text-[11px] mt-4 tracking-widest uppercase" style={{ fontFamily: fontMono }}>
            Powered by RAG · Secured by Firewall
          </p>
        </div>
      </main>
    </>
  );
}
