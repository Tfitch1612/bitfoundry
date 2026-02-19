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

    (async () => {
      try {
        const res = await fetch(`/api/verify-session?session_id=${sessionId}`, {
          method: "GET",
          cache: "no-store",
        });

        const json = (await res.json()) as VerifyResponse;

        if (!res.ok) {
          setError(json.error || "Failed to verify payment.");
        } else {
          setData(json);
        }
      } catch (e: any) {
        setError(e?.message || "Network error verifying payment.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Verifying payment…</h1>
        <p>Please wait.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Could not verify payment</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Unknown state</h1>
      </main>
    );
  }

  if (!data.paid) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Payment not complete</h1>
        <p>Status: {data.payment_status}</p>
        <p>Session: {data.id}</p>
      </main>
    );
  }

  const dollars =
    typeof data.amount_total === "number"
      ? (data.amount_total / 100).toFixed(2)
      : null;

  return (
    <main style={{ padding: 24 }}>
      <h1>Payment success ✅</h1>
      <p><b>Status:</b> {data.payment_status}</p>
      {dollars && data.currency && (
        <p>
          <b>Amount:</b> {dollars} {data.currency.toUpperCase()}
        </p>
      )}
      {data.customer_email && (
        <p>
          <b>Email:</b> {data.customer_email}
        </p>
      )}
      <p style={{ wordBreak: "break-all" }}>
        <b>Session:</b> {data.id}
      </p>
    </main>
  );
}
