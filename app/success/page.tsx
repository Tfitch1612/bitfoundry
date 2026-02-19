"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <main style={{ padding: 24 }}>
      <h1>Success</h1>
      <p>Thank you! Your payment has been received.</p>
      {sessionId ? (
        <p>
          <strong>Session:</strong> {sessionId}
        </p>
      ) : null}
    </main>
  );
}