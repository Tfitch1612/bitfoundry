"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResponse = {
  paid: boolean;
  payment_status: string | null;
  amount_total: number | null;
  currency: string | null;
  customer_email: string | null;
  id: string | null;
  error?: string;
};

export default function SuccessClient() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerifyResponse | null>(null);

  async function load() {
    if (!sessionId) {
      setData({ paid: false, payment_status: null, amount_total: null, currency: null, customer_email: null, id: null, error: "No session_id in URL" });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const json = (await res.json()) as VerifyResponse;

      if (!res.ok) {
        setData({
          paid: false,
          payment_status: null,
          amount_total: null,
          currency: null,
          customer_email: null,
          id: null,
          error: json?.error || "Verify failed",
        });
      } else {
        setData(json);
      }
    } catch (e: any) {
      setData({
        paid: false,
        payment_status: null,
        amount_total: null,
        currency: null,
        customer_email: null,
        id: null,
        error: e?.message || "Network error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const dollars =
    typeof data?.amount_total === "number" ? (data.amount_total / 100).toFixed(2) : null;

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Payment success ✅</h1>

      {loading && <p>Loading payment details…</p>}

      {!loading && data?.error && (
        <>
          <p style={{ marginTop: 12 }}>
            <b>Error:</b> {data.error}
          </p>
          <button onClick={load} style={{ marginTop: 12 }}>
            Retry
          </button>
        </>
      )}

      {!loading && !data?.error && data && (
        <>
          <p style={{ marginTop: 12 }}>
            <b>Status:</b> {data.payment_status ?? "unknown"}
          </p>

          {dollars && data.currency && (
            <p>
              <b>Amount:</b> ${dollars} {data.currency.toUpperCase()}
            </p>
          )}

          {data.customer_email && (
            <p>
              <b>Email:</b> {data.customer_email}
            </p>
          )}

          <p style={{ wordBreak: "break-all" }}>
            <b>Session:</b> {data.id ?? sessionId}
          </p>

          <button onClick={load} style={{ marginTop: 12 }}>
            Refresh details
          </button>
        </>
      )}
    </main>
  );
}