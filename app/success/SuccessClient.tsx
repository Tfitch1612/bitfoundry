"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <main style={{ padding: 24 }}>
      <h1>Success</h1>
      <p>Session: {sessionId ?? "none"}</p>
    </main>
  );
}
