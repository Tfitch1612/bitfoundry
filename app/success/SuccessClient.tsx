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
    let cancelled = false;

    async function run() {
      if (!sessionId) {
        setLoading(false);
        setError("No session_id found in the URL.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/verify-session?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );

        const json = (await res.json()) as VerifyResponse;

        if (!res.ok) {
          throw new Error(json?.error || "Failed to verify session");
        }

        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const dollars =
    typeof data?.amount_total === "number"
      ? (data.amount_total / 100).toFixed(2)
      : null;

  return (
    <main style={{ padding: 24 }}>
      <h1>Payment success ✅</h1>

      {loading && <p>Verifying payment…</p>}

      {!loading && error && (
        <>
          <p style={{ fontWeight: 700 }}>Could not verify payment.</p>
          <p>{error}</p>
          {sessionId && (
            <p style={{ wordBreak: "break-all" }}>
              <b>Session:</b> {sessionId}
            </p>
          )}
        </>
      )}

      {!loading && !error && data && (
        <>
          <p>
            <b>Status:</b> {data.payment_status}
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
            <b>Session:</b> {data.id}
          </p>

          {!data.paid && (
            <p style={{ marginTop: 12 }}>
              ⚠️ This session is not marked as paid yet.
            </p>
          )}
        </>
      )}
    </main>
  );
}