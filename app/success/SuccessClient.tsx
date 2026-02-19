"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <main style={{ padding: 24 }}>
      <h1>Payment success ✅</h1>
      <p>Session: {sessionId ?? "No session_id in URL"}</p>
    </main>
  );
}
