"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResponse = {
  paid: boolean;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  customer_email: string | null;
  id: string;
  error?: string;
};

export default function SuccessClient() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session_id in URL.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const json = await res.json();

        if (!res.ok) {
          setError(json?.error ?? "Failed to verify session.");
        } else {
          setData(json);
        }
      } catch (err) {
        console.error(err);
        setError("Unexpected error verifying payment.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [sessionId]);

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <h2>Verifying payment...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const dollars =
    typeof data.amount_total === "number"
      ? (data.amount_total / 100).toFixed(2)
      : null;

  return (
    <main style={{ padding: 24 }}>
      <h1>Payment success ✅</h1>

      <p>
        <strong>Status:</strong> {data.payment_status}
      </p>

      {dollars && data.currency && (
        <p>
          <strong>Amount:</strong> ${dollars} {data.currency.toUpperCase()}
        </p>
      )}

      {data.customer_email && (
        <p>
          <strong>Email:</strong> {data.customer_email}
        </p>
      )}

      <p style={{ wordBreak: "break-all" }}>
        <strong>Session:</strong> {data.id}
      </p>
    </main>
  );
}