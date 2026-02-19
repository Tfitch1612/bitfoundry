"use client";

export default function StartPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Start</h1>

      <button
        onClick={async () => {
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
            return;
          }

          window.location.href = data.url;
        }}
      >
        Pay $319
      </button>
    </main>
  );
}