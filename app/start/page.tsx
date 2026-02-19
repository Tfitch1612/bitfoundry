"use client";

import { useState } from "react";

export default function StartPage() {
  const [loading, setLoading] = useState(false);

  return (
    <main style={{ padding: 24 }}>
      <h1>Start</h1>

      <button
        disabled={loading}
        onClick={async () => {
          try {
            setLoading(true);

            const res = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: 319,
                description: "Business formation service",
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              alert(data?.error ?? "Checkout failed");
              setLoading(false);
              return;
            }

            // Use assign() (slightly more reliable than href in some cases)
            window.location.assign(data.url);
          } catch (err) {
            console.error(err);
            alert("Checkout failed");
            setLoading(false);
          }
        }}
      >
        {loading ? "Redirecting..." : "Pay $319"}
      </button>
    </main>
  );
}