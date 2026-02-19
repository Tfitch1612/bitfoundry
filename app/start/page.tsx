"use client";

import { useState } from "react";

export default function StartPage() {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (loading) return;
    setLoading(true);

    try {
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

      // Stripe-hosted Checkout
      window.location.assign(data.url);
    } catch (err) {
      alert("Network error starting checkout");
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Start</h1>

      <button onClick={handlePay} disabled={loading}>
        {loading ? "Redirecting to Stripe…" : "Pay $319"}
      </button>
    </main>
  );
}