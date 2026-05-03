"use client";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<any>(null);  

  const sendQuery = async () => {
    const res = await fetch("http://127.0.0.1:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    setResponse(data); 
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold">RAG Firewall</h1>

      <input
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        type="text"
        placeholder="Enter your query..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        onClick={sendQuery}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>

      {/* Updated UI */}
      <div className="mt-4 p-4 border w-80 text-black bg-white">
        {response && (
          <>
            <p><strong>Answer:</strong> {response.answer}</p>

            <p className="mt-2"><strong>Chunks:</strong></p>
            <ul>
              {response.chunks.map((c: string, i: number) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>

            <p className="mt-2"><strong>Blocked:</strong></p>
            <ul>
              {response.blocked_chunks.map((b: string, i: number) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}