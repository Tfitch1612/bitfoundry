import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export const dynamic = "force-dynamic"; // IMPORTANT: put it here (page.tsx)

export default function SuccessPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <SuccessClient />
    </Suspense>
  );
}